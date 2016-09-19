/*!
 * jquery.awesome-WebUploader
 * 2016.09.13 15:01
 * sandmanman.csser#foxmail.com
 * ========================================================================
 * 该插件是基于Baidu WebUploader 实例的封装，必须引用WebUploader的相关资源
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
            wrap: 'webuploader-wrap',
            multi: true, // 是否上传多个文件，默认可以上传多个
            swf: '/webuploader/dist/Uploader.swf', // swf地址
            server: '/server/fileupload.php', // 上传文件服务端接受地址
            fileSingleSize: '2', // 单个文件大小，默认2MB
            buttonText: '选择文件', // 按钮文字
            buttonClass: 'btn btn-primary btn-sm', // 按钮class
            fileType: 'gif,jpg,jpeg,bmp,png', // 允许的文件后缀，不带点，多个用逗号分割
            fileValidateMessage: { // 上传文件不符合要求的提示文字
                size: '文件大小超出限制',
                totalSizeLimit: '添加的文件总大小超出限制',
                numLimit: '文件数量超出限制',
                type: '文件类型不满足要求',
                duplicate: '不能选择相同文件'
            }
        };


    var state = 'pedding', // 可能有pedding, ready, uploading, confirm, done.
        percentages = {}, // 所有文件的进度信息，key为file id
        uploader; // WebUploader实例


    if (!WebUploader.Uploader.support()) {
        alert('Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
        throw new Error('WebUploader does not support the browser you are using.');
    }


    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }


    $.extend(Plugin.prototype, {
        init: function() {
            this.createWebUploader();
        },

        createWebUploader: function() {
            /*
             * WebUploader实例化
             */
            uploader = new WebUploader.Uploader({
                pick: {
                    id: '#' + $('#' + this.settings.wrap).attr('id') + '-file-picker',
                    innerHTML: this.settings.buttonText, // 按钮文字
                    multiple: false // 是否开起同时选择多个文件能力
                },
                formData: {
                    //isAjax: 'Y', //判断是ajax操作的依据,否则按照正常页面跳转判断session是否超时就不对了
                    //module_name: module,
                },
                swf: this.settings.swf, // swf文件路径
                server: this.settings.server, // 文件接收服务端
                sendAsBinary: true, //后台以stream形式接收
                auto: true, //选择文件后自动上传
                duplicate: true, //可以上传相同的文件
                accept: {
                    title: 'Images', // 文字描述
                    extensions: this.settings.fileType, // 允许的文件后缀，不带点，多个用逗号分割
                    mimeTypes: 'image/gif, image/jpg, image/jpeg, image/bmp, image/png'
                },
                thumb: {
                    type: ''
                },
                disableGlobalDnd: true, // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
                fileSingleSizeLimit: this.settings.fileSingleSize * 1024 * 1024 // 单个文件最大2MB
            });

            var pickElement = uploader.options.pick.id;

            // 为上传按钮追加class
            $(pickElement).find('.webuploader-pick').addClass(this.settings.buttonClass);


            /*
             * 文件加入上传队列后触发
             */
            uploader.onFileQueued = function(file) {
                var wrapID = $(pickElement).parent().attr('id');
                var $queue = $('#' + wrapID + '-list');
                Plugin.prototype.addFile(file, $queue);
            };


            /*
             * 文件上传过程中创建进度条实时显示
             */
            uploader.on( 'uploadProgress', function( file, percentage ) {
                var $li = $('#'+file.id),
                $percent = $li.find('.progress-bar');

                // 避免重复创建
                if ( !$percent.length ) {
                    $percent = $('<div class="progress"><div class="progress-bar progress-bar-info progress-bar-striped active"><span></span></div></div>')
                            .appendTo( $li )
                            .find('.progress-bar');
                }

                $percent.css( 'width', percentage * 100 + '%' );
                percentages[ file.id ][ 1 ] = percentage;
            });


            /*
             * 当上传文件信息不满足要求时触发
             */
            uploader.on( 'error', function(code) {
                console.log(code)
                if (code == 'F_EXCEED_SIZE') {
                    alert('添加文件大小超出限制');
                } else if (code == 'Q_EXCEED_NUM_LIMIT') {
                    alert('添加的文件数量超出限制');
                } else if (code == 'Q_EXCEED_SIZE_LIMIT') {
                    alert('添加的文件总大小超出限制');
                } else if (code == 'Q_TYPE_DENIED') {
                    alert('文件类型不满足要求');
                } else if (code == 'F_DUPLICATE') {
                    alert('不能选择相同文件');
                } else {
                    alert(code);
                }
            });


            /*
             * 不管成功或者失败，文件上传完成时触发
             */
            uploader.on( 'uploadComplete', function( file ) {
                //console.log(file.name);
                $( '#'+file.id ).find('.progress').remove();
                // setTimeout(function(){
                //     $( '#'+file.id ).find('.success').fadeOut();
                // },1500);
                // $( '#'+file.id ).append('<span class="success"><i class="fa fa-check"></i></span>');
            });

            /*
             * 当某个文件上传到服务端响应后，会派送此事件来询问服务端响应是否有效。
             * 如果此事件handler返回值为false, 则此文件将派送server类型的uploadError事件
             */
            // uploader.on( 'uploadAccept', function( file, response ) {
            //     console.log(response);
            //     if ( !response.result == null ) {
            //         // 通过return false来告诉组件，此文件上传有错。
            //         return false;
            //     }
            // });

            /*
             * 当文件上传出错时触发
             */
            uploader.on( 'uploadError', function( file, reason ) {
                console.log(reason);
            });

            /*
             * 当文件上传成功时触发
             */
            uploader.on( 'uploadSuccess', function( file, response, reason ) {
                console.log(response.fileName);
                $( '#'+file.id ).append('<span class="success"><i class="fa fa-check"></i></span>');
            });
        },

        /*
         * 当有文件添加进来时执行，负责view的创建
         */
        addFile: function(file, queue) {
            var text = '';

            var $li = $('<div class="img-thumbnail" id="' + file.id + '">' +
                    '<div class="img-wrap"></div>' +
                    '<p class="title">' + file.name + '</p>' +
                    '<div class="progress"><div class="progress-bar progress-bar-info progress-bar-striped active"><span></span></div></div>' +
                    '</div>'),
                $removeBtn = '<span class="cancel" title="删除"><i class="fa fa-close"></i></span>',
                $btns = $('<div class="file-panel">' + $removeBtn + '</div>' ).appendTo($li),
                $prgress = $li.find('.progress-bar'),
                $imgWrap = $li.find('.img-wrap'),
                $info = $('<div class="error"></div>'),

                showError = function(code) {
                    switch (code) {
                        case 'exceed_size':
                            text = '文件大小超出';
                            break;
                        case 'interrupt':
                            text = '上传暂停';
                            break;
                        default:
                            text = '上传失败，请重试';
                            break;
                    }
                    $info.text(text).appendTo($li);
                };

            // 优化retina, 在retina下这个值是2
            var ratio = window.devicePixelRatio || 1;
            // 缩略图大小
            var thumbnailWidth = 110 * ratio;
            var thumbnailHeight = 110 * ratio;

            if ( file.getStatus === 'invalid' ) {
                showError(file.statusText);
            } else {
                $imgWrap.text('正在上传..');
                // @todo lazyload
                uploader.makeThumb(file, function(error, src) {
                    if (error) {
                        $imgWrap.text('不能预览');
                        return;
                    }
                    var img = $('<img src="' + src + '">');
                    $imgWrap.empty().append(img);
                }, thumbnailWidth, thumbnailHeight);
                percentages[file.id] = [file.size, 0];
                file.rotation = 0;
            }

            file.on('statuschange', function(cur, prev) {
                if (prev === 'progress') {
                    $prgress.parent('.progress').hide();
                    $prgress.width(0);
                } else if ( prev === 'queued' ) {
                    $btns.remove();
                }
                // 成功
                if (cur === 'error' || cur === 'invalid') {
                    showError(file.statusText);
                    percentages[file.id][1] = 1;
                } else if (cur === 'interrupt') {
                    showError('interrupt');
                } else if (cur === 'queued') {
                    $prgress.parent('.progress').css('display', 'block');
                } else if (cur === 'progress') {
                    $info.remove();
                    $prgress.parent('.progress').css('display', 'block');
                } else if (cur === 'complete') {
                    $prgress.parent('.progress').hide();
                    $prgress.width(0);
                }

                $li.removeClass( 'state-' + prev ).addClass( 'state-' + cur );
            });

            $li.appendTo(queue);

        }, // addFile End

        /*
         * 移除文件
         */
        removeFile: function(file, queue) {

        } // removeFile End


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
