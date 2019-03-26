var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');

// 处理通用的数据
router.use(function (req, res, next) {
  data = {
    userInfo: req.userInfo,
    categories: []
  };
  Category.find().sort({ _id: -1 }).then(function (categories) {
    data.categories = categories;
    next();
  });
});

// 首页
router.get('/', function (req, res, next) {
  data.category = req.query.category || '';
  data.page = Number(req.query.page) || 1;
  data.limit = 2;
  data.pages = 0;
  data.count = 0;
  var where = {};
  if (data.category) {
    where.category = data.category
  }
  // 读取内容
  Content.where(where).count().then(function (count) {
    data.count = count;
    data.pages = Math.ceil(data.count / data.limit);
    data.page = Math.min(data.page, data.pages);
    data.page = Math.max(data.page, 1);
    var skip = (data.page - 1) * data.limit;
    return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({ addTime: -1 });
  }).then(function (contents) {
    data.contents = contents;
    res.render('main/index', data);
  });
});

router.get('/view', function (req, res) {
  var contentid = req.query.contentid || '';
  Content.findOne({
    _id: contentid
  }).then(function (content) {
    data.content = content;
    // 阅读量增加
    content.views++;
    // 保存阅读量
    content.save();
    res.render('main/view', data);
  });
});

module.exports = router;

