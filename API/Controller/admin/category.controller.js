const Category = require('../../../Models/category')
const Product = require('../../../Models/product')

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await Category.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;

    const categories = await Category.find();


    if (!keyWordSearch) {
        res.json({
            categories: categories.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = categories.filter(value => {
            return value.category.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            categories: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.create = async (req, res) => {
    const category = await Category.find();

    const categoryFilter = category.filter((c) => {
        return c.category.toUpperCase() === req.query.name.toUpperCase().trim()
    });

    if (categoryFilter.length > 0) {
        res.json({ msg: 'Loại đã tồn tại' })
    } else {
        var newcategory = new Category()
        req.query.name = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
        newcategory.category = req.query.name

        newcategory.save();
        res.json({ msg: "Bạn đã thêm thành công" })
    }
}

module.exports.delete = async (req, res) => {
    console.log(req.query)
    const id = req.query.id;

    await Category.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })

}


module.exports.detailProduct = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;


    let start = (page - 1) * perPage;
    let end = page * perPage;

    const category = await Category.findOne({ category: req.params.id });


    let products = await Product.find({ id_category: category._id }).populate('id_category');
    const totalPage = Math.ceil(products.length / perPage);

    if (!keyWordSearch) {
        res.json({
            products: products.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = products.filter(value => {
            return value.name_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.price_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
            // value.id_category.category.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            products: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.update = async (req, res) => {
    const category = await Category.find();

    const categoryFilter = category.filter((c) => {
        return c.category.toUpperCase() === req.query.name.toUpperCase().trim() && c.id !== req.query.id
    });

    if (categoryFilter.length > 0) {
        res.json({ msg: 'Loại đã tồn tại' })
    } else {
        req.query.name = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
        await Category.updateOne({ _id: req.query.id }, { category: req.query.name }, function (err, res) {
            if (err) return res.json({ msg: err });
        });
        res.json({ msg: "Bạn đã update thành công" })
    }
}

module.exports.detail = async (req, res) => {
    const category = await Category.findOne({ _id: req.params.id });

    res.json(category)
}

// module.exports.getCategoryItemCount = async (req, res) => {
//     try {
//         const categories = await Category.find();
//         const categoryIds = categories.map(category => category._id);

//         const categoryItemCount = await Product.aggregate([
//             {
//                 $match: {
//                     id_category: { $in: categoryIds }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$id_category",
//                     itemCount: { $sum: 1 }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "category"
//                 }
//             },
//             {
//                 $unwind: "$category"
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     category: "$category.category",
//                     itemCount: 1
//                 }
//             }
//         ]);

//         res.json(categoryItemCount);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ msg: 'Có lỗi xảy ra trong quá trình lấy số lượng sản phẩm theo loại', error: err });
//     }
// };