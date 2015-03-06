/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');

var MForm = require('../modules/form');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  function makeForm(id, data) {
    data || (data = {});

    data[host.get('uniqueId')] = id;

    var form = new MForm($.extend(true, {
      // name: '',
      // action: '',
      method: 'PATCH',

      // 表单数据
      formData: data,

      parentNode: host.get('parentNode'),

      events: {
        'click [data-role=form-cancel]': function() {
          plugin.trigger('hide', this);
        }
      }
    }, plugin.options))
    .on('submit', function(e) {
      e.preventDefault();
      plugin.trigger('submit', this.get('dataParser').call(this));
    });

    return form;
  }

  // helpers

  function getItem(target) {
    return host.$(target).closest('[data-role=item]');
  }

  function getItemId(target) {
    return getItem(target).data('id');
  }

  host.get('itemActions').push({
    'role': 'edit-item',
    'text': '编辑'
  });

  host.delegateEvents({
    'click [data-role=edit-item]': function(e) {
      var id = getItemId(e.currentTarget),
        key = 'form-' + id;

      if (!plugin[key]) {
        host.GET(id)
        .done(function(data) {
          // TODO: hack 移到业务
          // 接口的 REST 不规范，采用 hack
          data = data.items[0];

          plugin[key] = makeForm(id, data).render();

          plugin.trigger('show', plugin[key]);
        })
        .fail(function(error) {
          Alert.show(error);
        });
      } else {
        plugin.trigger('show', plugin[key]);
      }
    }
  });

  plugin.on('show', function(form) {
    host.element.hide();
    form.element.show();
  });

  plugin.on('hide', function(form) {
    host.element.show();
    form.element.hide();
  });

  plugin.on('submit', function(id, data) {
    host.PATCH(id, data)
      .done(function(/*data*/) {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide', plugin['form-id']);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  this.ready();
};
