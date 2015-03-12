/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-06 16:09:55
 */

'use strict';

var $ = require('jquery');

var MForm = require('../modules/form');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var form = new MForm($.extend(true, {
    name: 'grid-search',
    className: 'ui-form-search',
    buttons: [{
      label: '搜索',
      type: 'submit',
      role: 'form-submit'
    }],
    parentNode: host.element,
    insertInto: function(element, parentNode) {
      element.prependTo(parentNode);
    }
  }, plugin.options))
  .on('formSubmit', function() {
    var that = this;
    // 调用队列
    this.queue.run(function() {
      plugin.trigger('submit', that.get('dataParser').call(that));
    });
    // 阻止默认事件发生
    return false;
  }).render();

  plugin.on('submit', function(data) {
    host.getList(data, true);
  });

  // 刷新参数，重置表单
  host.on('change:params', function(params) {
    var fields = form.get('fields');

    $.each(fields, function(i, item) {
      var name = item.name,
        value = params && (name in params) ? params[name] : item.value;

      form.$('[name="' + name + '"]').val(value);
    });
  });

  // 通知就绪
  this.ready();
};
