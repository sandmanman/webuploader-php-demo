/**
  上传图片 webUploader实例封装
  @param $wrap 上传区域的最顶层容器的jq对象,很重要,程序需要通过他去find各类所需元素
  @param $residHidden 存储图片id的hidden的jq对象
  @param isMulti 是否允许上传多张,'Y'-允许,'N'-不允许,比如Logo上传1张,店面图片能够上传多张
*/
function uploadPic($wrap, $residHidden, isMulti) {
    // 上传区域容器
    // var $wrap = $('#' + wrap + '');
    // var $queueList = $wrap.find('.queueList');
    // 存储上传文件resid的隐藏项, 规则就是wrap_resid, 与表字段名相同
    // var $residHidden = $('#' + wrap + '_resid');
    // 优化retina, 在retina下这个值是2
    var ratio = window.devicePixelRatio || 1;
    // 缩略图大小
    var thumbnailWidth = 110 * ratio;
    var thumbnailHeight = 110 * ratio;
    // 所有文件的进度信息，key为file id
    var percentages = {};
    // WebUploader实例
    var uploader;
    if (!WebUploader.Uploader.support()) {
        alert('Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
        throw new Error('WebUploader does not support the browser you are using.');
    }
    /**
      上传文件公共方法
      当有文件添加进来时执行，负责view的创建
      @param file
    */
    var addFile = function(file, queue) {
        var $li = $('<li class="thumbnail" id="' + file.id + '">' +
                '<p class="title">' + file.name + '</p>' +
                '<div class="imgWrap"></div>' +
                '<p class="upload-progress"><span class="spin ion-load-c"></span></p>' +
                '</li>'),
            $btns = $('<div class="file-panel">' + '<span class="cancel" title="删除"><i class="ion-close-circled"></i></span>').appendTo($li),
            $prgress = $li.find('.upload-progress'),
            $imgWrap = $li.find('.imgWrap'),
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
        if (file.getStatus() === 'invalid') {
            showError(file.statusText);
        } else {
            $imgWrap.text('正在上传..');
            // @todo lazyload
            uploader.makeThumb(file, function(error, src) {
                if (error) {
                    $wrap.text('不能预览');
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
                $prgress.hide().width(0);
            }
            // 成功
            if (cur === 'error' || cur === 'invalid') {
                showError(file.statusText);
                percentages[file.id][1] = 1;
            } else if (cur === 'interrupt') {
                showError('interrupt');
            } else if (cur === 'queued') {
                $prgress.css('display', 'block');
            } else if (cur === 'progress') {
                $info.remove();
                $prgress.css('display', 'block');
            } else if (cur === 'complete') {
                $prgress.hide().width(0);
                $li.append('<span class="success"><i class="ion-checkmark"></i></span>');
            }
        });
        $li.on('mouseenter', function() {
            $btns.stop().animate({
                height: 30
            });
        });
        $li.on('mouseleave', function() {
            $btns.stop().animate({
                height: 0
            });
        });
        //点击图片右上角的删除按钮触发
        $btns.on('click', 'span', function() {
            var index = $(this).index();
            fileResid = $(this).parent().parent().find('.resid').html();
            switch (index) {
                case 0:
                    //从队列中移除图片
                    uploader.removeFile(file);
                    //从表单隐藏项中删除该resid
                    //要区分是否允许上传多个图片
                    if (isMulti == 'Y') { //如果允许上传多张
                        var residHiddenVal = $residHidden.val();
                        if (residHiddenVal !== '') {
                            var arrTemp = residHiddenVal.split(",");
                            var arrTempNew = [];
                            for (var i = 0; i < arrTemp.length; i++) {
                                if (arrTemp[i] != fileResid) {
                                    arrTempNew.push(arrTemp[i]);
                                }
                            }
                            $residHidden.val(arrTempNew.join(','));
                        }
                    } else { //如果只允许上传一张
                        //直接清空hidden
                        $residHidden.val('');
                    }
                    return;
            }
        });
        $li.appendTo(queue);
    };
    /**
      上传文件公共方法
      删除file时触发,负责view的销毁
      @param file
    */
    var removeFile = function(file) {
        var $li = $('#' + file.id);
        delete percentages[file.id];
        //查找刚上传成功的resid
        var findResId = $li.find('.overlay-container').attr('id');
        console.log('findResId==' + findResId);
        //去掉隐藏项中的该resid
        var currentHiddenResids = $residHidden.val();
        var currentHiddenResidsArray = currentHiddenResids.split(',');
        var newArray = [];
        for (var o in currentHiddenResidsArray) {
            if (findResId != currentHiddenResidsArray[o]) {
                newArray.push(currentHiddenResidsArray[o]);
            }
        }
        $residHidden.val(newArray.join(','));
        $li.off().find('.file-panel').off().end().remove();
    };
    // 实例化
    uploader = new WebUploader.Uploader({
        pick: {
            id: '#' + $wrap.attr('id') + '_file_picker',
            multiple: false
        },
        formData: {
            //isAjax: 'Y', //判断是ajax操作的依据,否则按照正常页面跳转判断session是否超时就不对了
            //module_name: module,
        },
        swf: '/webuploader/dist/Uploader.swf', // swf文件路径
        server: '/server/fileupload.php', // 文件接收服务端
        sendAsBinary: true, //后台以stream形式接收
        auto: true, //选择文件后自动上传
        duplicate: true, //可以上传相同的文件
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/gif, image/jpg, image/jpeg, image/bmp. image/png'
        },
        thumb: {
            type: ''
        },
        disableGlobalDnd: true, // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        fileSingleSizeLimit: 2 * 1024 * 1024 // 单个文件最大2MB
    });
    uploader.onUploadProgress = function(file, percentage) {
        var $li = $('#' + file.id),
            $percent = $li.find('.upload-progress');
        //$percent.css('width', percentage * 100 + '%');
        $percent.show();
    };
    //文件加入上传队列前触发
    uploader.onBeforeFileQueued = function(file) {
        //如果不允许上传多张图片,则移除之前上传的图片li
        if (isMulti == 'N') {
            $wrap.find('.filelist').html('');
            //直接清空hidden
            $residHidden.val('');
        }
    };
    //文件加入上传队列后触发
    uploader.onFileQueued = function(file) {
        var $queue = $('#' + $wrap.attr('id') + '_list');
        addFile(file, $queue);
    };
    //文件移出上传队列后触发
    uploader.onFileDequeued = function(file) {
        removeFile(file);
    };
    //当上传文件信息不满足要求时触发
    uploader.onError = function(code) {
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
    };
    //上传成功后处理
    uploader.onUploadSuccess = function(file, response) {
        //respoonse为server返回的信息
        console.log(response);
        console.log("respoonse返回如下信息：" + response.error + "--" + response.id);
        // //判断是否session超时
        // if (response.error['message'] == 'TIMEOUT') {
        //     ajaxTimeout();
        //     return;
        // }
        //上传成功后设置缩略图以及大图预览
        uploader.makeThumb(file, function(error, src) {
            var img;
            if (error) {
                $wrap.replaceWith('<span>不能预览</span>');
                return;
            }
            //设置大图打开地址
            relSrc = '/server/upload/' + file.name;
            console.log("relSrc===" + relSrc);
            img = $('<div id="' + response.id + '" class="overlay-container">' +
                '<img src="' + src + '" alt="'+'图片描述'+'">' +
                '<a href="' + relSrc + '" class="overlay-link popup-img-single" title="预览">' +
                '<i class="ion-ios-search-strong"></i>' +
                '</a>' +
                '</div>');
            $('#' + file.id).find('.imgWrap').html(img);

            //启用大图预览
            $('.popup-img-single').magnificPopup({
                type: "image",
                gallery: {
                    enabled: false,
                }
            });
        }, thumbnailWidth, thumbnailHeight);
        //在表单隐藏项中添加成功上传的resid
        var residHiddenVal = $residHidden.val();
        if (residHiddenVal == '') {
            residHiddenVal = response.id;
        } else {
            residHiddenVal += ',' + response.id;
        }
        $residHidden.val(residHiddenVal);
    };
    //上传失败后处理
    uploader.on('uploadError', function(file, response) {
        var $li = $('#' + file.id),
            $error = $li.find('.error');
        // 避免重复创建
        if (!$error.length) {
            $error = $('<div class="error"></div>').appendTo($li);
        }
        $error.text('上传失败');
    });
    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.on('uploadComplete', function(file) {
        $('#' + file.id).find('.upload-progress').remove();
    });
}
