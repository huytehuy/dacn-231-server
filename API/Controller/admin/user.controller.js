const User = require('../../../Models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await User.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;
    let users;
    if (req.query.permission) {
        users = await User.find({ id_permission: req.query.permission }).populate('id_permission')
    } else {
        users = await User.find({}).populate('id_permission')
    }


    if (!keyWordSearch) {
        res.json({
            users: users.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = users.filter(value => {
            return value.fullname.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            users: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.create = async (req, res) => {
    const user = await User.find();

    const userFilter = user.filter((c) => {
        return c.email === req.query.email.trim() || c.username === req.query.username.trim()
    });

    if (userFilter.length > 0) {
        res.json({ msg: 'Email hoặc username đã tồn tại' })
    } else {
        var newUser = new User()
        const salt = await bcrypt.genSalt();
        req.query.password = await bcrypt.hash(req.query.password, salt);
        req.query.name = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
        newUser.fullname = req.query.name
        newUser.username = req.query.username
        newUser.password = req.query.password
        if (req.query.permission) {
            newUser.id_permission = "6087dcb5f269113b3460fce4"
        } else newUser.id_permission = req.query.permission
        newUser.email = req.query.email

        newUser.save();
        res.json({ msg: "Bạn đã thêm thành công" })
    }
}

module.exports.delete = async (req, res) => {
    const id = req.query.id;

    await User.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })

}

module.exports.details = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });

    res.json(user)
}

module.exports.update = async (req, res) => {
    const user = await User.findOne({ _id: req.query.id });
    if (req.query.email && req.query.email !== user.email) {
        req.query.email = user.email
    }
    if (req.query.username && req.query.username !== user.username) {
        req.query.username = user.username
    }
    if (!req.query.password) {
        req.query.password = user.password;
    } else {
        const salt = await bcrypt.genSalt();
        req.query.password = await bcrypt.hash(req.query.password, salt);
    }

    req.query.name = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
    await User.updateOne({ _id: req.query.id }, {
        fullname: req.query.name,
        password: req.query.password,
        id_permission: req.query.permission
    }, function (err, res) {
        if (err) return res.json({ msg: err });
    });
    res.json({ msg: "Bạn đã update thành công" })
}

module.exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email }).populate('id_permission');

        if (!user) {
            return res.json({ msg: "Không Tìm Thấy User" });
        }

        const isPasswordValid = password == user.password;

        if (isPasswordValid) {
            const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
            return res.json({ msg: "Đăng nhập thành công", user, jwt: token });
        } else {
            return res.json({ msg: "Sai mật khẩu" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
};