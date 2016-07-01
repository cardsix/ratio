/**
 * Created by Fred on 16/6/29.
 */

(function(window, document){

    "use strict";

    /**
     * 原始尺寸（比例）无压缩、变形缩放图片
     *
     * 设定父元素固定宽高并且overflow: hidden，内部图片元素以原始比例缩放至父元素宽或高，对应另一个属性设置为auto
     * @XXX 方式1、现有父元素DOM display: inline-block/block
     * TODO 方式2、新建span元素作为父元素，且display: inline-block/block
     *
     * 1、获取图片，初始化图片容器为自定义比例宽高
     * 2、缓存图片，并替换图片为loading图片
     * 3、加载图片，加载完成后获取图片原始尺寸
     *    加载成功：获取图片原始尺寸
     *    TODO 加载失败：
     * 4、依据自定义比例宽高，设定图片实际显示尺寸（CSS宽高）
     *    原始比例 > 定义比例
     *    原始比例 < 定义比例
     * 5、替换loading图片为原图片
     */

    /**
     * 问题：过程中，发现loading图片的请求每次都是浏览器发送完所有dom图片的请求后才发送
     *
     * 需要的效果：
     * loading图片优先于DOM图片加载，且是毫秒级加载
     *
     * 解决办法：
     * 1、loading作为隐藏img元素，写在dom顶部 —— loading图片将在<head>元素中的引入资源之后加载
     * 2、dom图片的url地址写在_src属性中 —— dom加载完成后，不自动加载dom图片，而是通过ratio.js加载
     * 3、ratio.js写在文档末尾 —— 网页性能优化的一般做法是将<script>写在文档末尾
     *
     * html文档加载解析过程：
     * 下载html资源，同时解析dom树，解析过程中，遇到外部资源，自动发送异步请求
     */

    /**
     *
     * @type {{ratio: {width: number, height: number}, loading: string}}
     */
    var defaults = {
        ratio: {
            width: 300,
            height: 185.41
        },
        loading: 'loading.gif',
        callback : {
            mouseOver : function(image){
                //console.log(this);
            },
            mouseOut : function(image){
                //console.log(image);
            },
            error: function(image){
                //
            }
        }
    };

    /**
     * 获取loading图片dom对象
     */
    var getLoading = function(){
        //FIXME
        var dom = document.createElement('img');
            dom.src = defaults.loading;
            dom.display = 'inline-block';

        dom.onload = function(){
            var width = dom.width,
                height = dom.height;

            dom.style.width = '16px';
            dom.style.height = '16px';
        };

        return function(src, ratio){
            if(src && src.toLowerCase() != dom.src.toLowerCase()){
                dom.src = src;
                dom.style.marginLeft = (ratio.width / 2 - 8) + 'px';
                dom.style.marginTop = (ratio.height / 2 - 8) + 'px';
            }

            return dom.cloneNode();
        }
    }();

    /**
     * 依据图片原始尺寸比例缩放大小至自定义尺寸
     *
     * @param image DOM Object
     * @param ratio {{width: number, height: number}}
     */
    function zoom(image, ratio){
        //
        var width = parseInt(image.width),
            height = parseInt(image.height);

        if(width/height >= ratio.width/ratio.height){
            //宽图
            image.style.width = 'auto';
            image.style.height = ratio.height + 'px';
            image.style.marginLeft = '-' + (ratio.height * (width / height) - ratio.width) / 2 + 'px';
        } else {
            //长图
            image.style.width = ratio.width + 'px';
            image.style.height = 'auto';
            image.style.marginTop = '-' + (ratio.width / (width / height) - ratio.height) / 2 + 'px';
        }
    }

    /**
     * 初始化图片父容器为自定义尺寸
     *
     * @param image DOM Objec
     * @param options {{ratio: {width: number, height: number}, loading: string, callback: {mouseOver: function, mouseOut: function, error: function}}
     */
    function initRatio(image, options){
        if(image == null || image.nodeType != 1 || image.nodeName.toLowerCase() != 'img'){
            return false;
        }

        options = options || {};
        options.ratio = options.ratio || {};
        options.ratio.width = ratio.width || defaults.ratio.width;
        options.ratio.height = ratio.height || defaults.ratio.height;
        options.callback = options.callback || defaults.callback;
        options.loading = options.loading || defaults.loading;

        if(image.getAttribute('_src')){
            image.src = image.getAttribute('_src');
        }

        image.style.display = 'inline-block';
        /**
         * 移除image的尺寸样式和属性，方便计算image的实际尺寸（比例）（!important样式呢。。。）
         * FIXME 使用原图的src生成一个新image dom 元素，且不添加至文档流，ratio后，替换原图并销毁原图（太多DOM操作）
         */
        //image.style.maxWidth = 'none !important';
        image.style.maxWidth = 'none';
        image.style.minWidth = 'none';
        image.style.maxHeight = 'none';
        image.style.minHeight = 'none';
        image.style.width = 'auto';
        image.style.height = 'auto';
        image.removeAttribute('width');
        image.removeAttribute('height');

        //将image父元素设置为“块盒模式”，以便隐藏image多余的部分
        if(image.parentNode.style.display !== 'block'){
            image.parentNode.style.display = 'inline-block';
        }
        image.parentNode.style.overflow = 'hidden';
        image.parentNode.style.width = options.ratio.width + 'px';
        image.parentNode.style.height = options.ratio.height + 'px';

        if(image.complete == true){
            //已加载完成
            //TODO 未测试
            zoom(image, options.ratio);
        } else {
            //加载未完成
            var loading = getLoading(options.loading || defaults.loading, options.ratio);

            image.parentNode.insertBefore(loading, image);
            image.parentNode.removeChild(image);

            image.onload = function(){
                //加载成功
                zoom(image, options.ratio);

                loading.parentNode.insertBefore(image, loading);
                loading.parentNode.removeChild(loading);

                image.onmouseover = function(){
                    if(options.callback && options.callback.mouseOver && typeof options.callback.mouseOver == 'function'){
                        options.callback.mouseOver.call(this, this);
                    }
                };

                image.onmouseout = function(){
                    if(options.callback && options.callback.mouseOut && typeof options.callback.mouseOut == 'function'){
                        options.callback.mouseOut.call(this, this);
                    }
                }
            };

            image.onerror = function(){
                loading.parentNode.className += ' error';
                //loading.parentNode.removeChild(loading);
                if(options.callback && options.callback.error && typeof options.callback.error == 'function'){
                    options.callback.error.call(this, this);
                }
            }
        }
    }

    window.ratio = window.ratio || function(dom, options){
            initRatio(dom, options);
        }

})(window, document);