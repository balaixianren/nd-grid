/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var debug = require('nd-debug');
var Confirm = require('nd-confirm');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    awaiting;

  var delItem = function(id, callback) {
    var actionDelete = plugin.getOptions('DELETE') || function(id) {
      return host.DELETE(id);
    };

    actionDelete(id)
    .done(function( /*data*/ ) {
      host.deleteItem(id);

      getDelCheck().prop('disabled', !getChecked().length);
    })
    .fail(function(error) {
      debug.error(error);
    })
    .always(callback);
  };

  // helpers

  function getChecked() {
    return host.$('[name="check-item"]:checked');
  }

  function getDelCheck() {
    return host.$('[data-role="del-check"]');
  }

  host.addGridAction($.extend({
    role: 'del-check',
    text: '删除选定',
    tips: '确定删除选定？',
    disabled: true
  }, plugin.getOptions('button')), function(e) {
    if (awaiting) {
      return;
    }

    Confirm.show(e.currentTarget.getAttribute('data-tips'), function() {
      awaiting = true;

      plugin.trigger('submit', $.map(getChecked(), function(item) {
        return item.value;
      }), function() {
        awaiting = false;
      });
    });
  });

  host.delegateEvents({

    // 全选
    'change [data-role="check-all"]': function(e) {
      getDelCheck().prop('disabled', !e.currentTarget.checked);
    },

    // 选中行
    'change [name="check-item"]': function(e) {
      if (e.currentTarget.checked) {
        getDelCheck().prop('disabled', false);
      } else {
        getDelCheck().prop('disabled', !getChecked().length);
      }
    }

  });

  plugin.on('submit', function(ids, done) {
    // TODO: batch delete?
    var count = ids.length;
    var ready = 0;

    function cb() {
      if (++ready === count) {
        done();
      }
    }

    ids.forEach(function(id) {
      delItem(id, cb);
    });
  });

  host.after('renderPartial', function() {
    getDelCheck().prop('disabled', !getChecked().length);
  });

  //删除item后重新判断是否disabled
  host.on('deleteItemDone', function() {
    getDelCheck().prop('disabled', !getChecked().length);
  });

  // 通知就绪
  this.ready();
};
