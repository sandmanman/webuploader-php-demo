/*!
 * jquery.awesome-WebUploader
 * Baidu WebUploader 实例的封装
 * 2016.09.13 15:01
 * sandmanman.csser#foxmail.com
 */

if (typeof jQuery === 'undefined') {
    throw new Error('awesomeWebUploader必须引入jQuery！');
}
if (typeof WebUploader === 'undefined') {
    throw new Error('awesomeWebUploader必须引入WebUploader！');
}

// 这个分号的作用是防止和其他jquery插件合并时，别人不规范的jquery插件忘记使用分号结束
// 影响到我们当前的插件，导致无法运行的问题。
;
(function($, window, document, undefined) {
    'use strict';
    // undefined作为形参的目的是因为在es3中undefined是可以被修改的
    // 比如我们可以声明var undefined = 123,这样就影响到了undefined值的判断，幸运的是在es5中,undefined不能被修改了。
    // window和document本身是全局变量，在这个地方作为形参的目的是因为js执行是从里到外查找变量的（作用域），把它们作为局部变量传进来，就避免了去外层查找，提高了效率。

    // 声明默认属性对象
    var pluginName = 'awesomeWebUploader',
        // 默认设置
        defaults = {
            multi: true, // 是否上传多个文件，默认可以上传多个
            swf: '', // swf地址
            server: '', // 上传文件服务端接受地址
            singleFileSize: '2', // 单个文件大小，默认2MB
            buttonText: '选择文件', // 按钮文字
            buttonClass: 'btn btn-primary', // 按钮class
            fileValidateMessage: { // 上传文件不符合要求的提示文字
                size: '文件大小超出限制',
                totalSizeLimit: '添加的文件总大小超出限制',
                numLimit: '文件数量超出限制',
                type: '文件类型不满足要求',
                duplicate: '不能选择相同文件'
            }
        };

    // 构造函数
    function Plugin(element, options) {
        this.element = element;
        // 将默认属性对象和传递的参数对象合并到第一个空对象中
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // 为了避免和原型对象Plugin.prototype的冲突，这地方采用继承原型对象的方法
    $.extend(Plugin.prototype, {
        init: function() {
            // 初始化，由于继承自Plugin原型，
            // 你可以在这里直接使用this.element或者this.settings
            console.log('xD');
            console.log(this.element);
            console.log('默认设置：');
            console.log(this.settings);

            //$(this.element).addClass('TEST');
        },
        yourOtherFunction: function() {

        }
    });

    // 对构造函数的一个轻量级封装，
    // 防止产生多个实例
    $.fn[pluginName] = function(options) {
        this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });

        // 方便链式调用
        return this;
    };

})(jQuery, window, document);
