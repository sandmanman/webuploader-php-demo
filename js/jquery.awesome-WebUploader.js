/*!
 * jquery.awesome-WebUploader
 * 该插件是基于Baidu WebUploader 实例的封装，必须引用WebUploader的相关资源
 * 2016.09.13 15:01
 * sandmanman.csser#foxmail.com
 * ========================================================================
 * 基础DOM
 * <div id="webuploader-wrap">
 *   <div class="webuploader-list" id="webuploader-wrap-list"></div>
 *   <div id="webuploader-wrap-file-picker">选择文件</div>
 * </div>
 */

if (typeof jQuery === 'undefined') {
    throw new Error('必须引入jQuery！');
}
if (typeof WebUploader === 'undefined') {
    throw new Error('必须引入WebUploader！');
}

;
(function($, window, document, undefined) {

    'use strict';

    // 声明默认属性对象
    var pluginName = 'awesomeWebUploader',
        // 默认设置
        defaults = {
            //wrapID: 'awuWrap',
            multi: true, // 是否上传多个文件，默认可以上传多个
            swf: '', // swf地址
            server: '', // 上传文件服务端接受地址
            singleFileSize: '2', // 单个文件大小，默认2MB
            buttonText: '选择文件', // 按钮文字
            buttonClass: 'btn btn-primary', // 按钮class
            fileType: '',
            fileValidateMessage: { // 上传文件不符合要求的提示文字
                size: '文件大小超出限制',
                totalSizeLimit: '添加的文件总大小超出限制',
                numLimit: '文件数量超出限制',
                type: '文件类型不满足要求',
                duplicate: '不能选择相同文件'
            }
        };


    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }


    $.extend(Plugin.prototype, {
        init: function() {
            console.log('#'+$(this.element).attr('id'));
            console.log(this.settings);

            this.yourOtherFunction( "jQuery Boilerplate" );
        },
        yourOtherFunction: function(text) {
            $( this.element ).addClass( text );
            console.log($( this.element ).attr('class'));
        }
    });


    $.fn[pluginName] = function(options) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
        });

        return this;
    };

})(jQuery, window, document);
