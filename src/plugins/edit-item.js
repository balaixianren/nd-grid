/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var FormExtra = require('nd-form-extra');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {},
    uniqueId,
    awaiting;

  function makeForm(data) {
    return new FormExtra($.extend(true, {
      name: 'grid-edit-item',
      // action: '',
      method: 'PATCH',
      // 表单数据
      formData: data,
      proxy: host.get('proxy'),
      parentNode: host.get('parentNode')
    }, options))
    .on('formCancel', function() {
      plugin.trigger('hide', this);
    })
    .on('formSubmit', function() {
      this.submit(function(data) {
        plugin.trigger('submit', data);
      });
      // 阻止默认事件发生
      return false;
    });
  }

  host.addItemAction($.extend({
    'role': 'edit-item',
    'text': '编辑'
  }, options.button), options.button && options.button.index || 0);

  // 移除参数
  delete options.button;

  // 异步插件，需要刷新列表
  if (plugin._async) {
    host._renderPartial();
  }

  host.delegateEvents({
    'click [data-role="edit-item"]': function(e) {
      if (awaiting) {
        return;
      }

      if (!plugin.exports) {
        // 添加用于阻止多次点击
        awaiting = true;

        uniqueId = host.getItemIdByTarget(e.currentTarget);

        host.GET(uniqueId)
        .done(function(data) {
          plugin.exports = makeForm(data).render();
          plugin.trigger('show', plugin.exports);
        })
        .fail(function(error) {
          Alert.show(error);
        })
        .always(function() {
          awaiting = false;
        });
      } else {
        plugin.trigger('show', plugin.exports);
      }
    }
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  plugin.on('show', function(form) {
    // 通知就绪
    // plugin.ready();

    host.element.hide();
    form.element.show();
  });

  plugin.on('hide', function(form) {
    host.element.show();
    form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data) {
    host.PATCH(uniqueId, data)
      .done(function(/*data*/) {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  this.ready();
};
