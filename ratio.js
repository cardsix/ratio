/**
 * Created by Fred on 16/6/29.
 */

(function(window, document){

    "use strict";

    /**
     * 自定义比例缩放图片
     *
     * 1、获取图片，初始化图片容器为自定义比例宽高
     * 2、缓存图片，并替换图片为loading图片
     * 3、加载图片，加载完成后获取图片原始尺寸
     *    加载成功：获取图片原始尺寸
     *    @todo 加载失败：
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
            height: 150
        },
        loading: 'loading.gif'
    };

    /**
     * 获取loading图片dom对象
     */
    var getLoading = function(){

        var dom = document.createElement('img');
            dom.src = defaults.loading;
            dom.display = 'inline-block';

        dom.onload = function(){
            var width = dom.width,
                height = dom.height;
            //
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

    function initRatio(image, ratio){
        //
        var width = image.width,
            height = image.height;

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

    function ratio(image, options){
        if(image == null || image.nodeType != 1 || image.nodeName.toLowerCase() != 'img'){
            return false;
        }

        options = options || {};
        ratio = options.ratio || {};
        ratio.width = ratio.width || defaults.ratio.width;
        ratio.height = ratio.height || defaults.ratio.height;

        if(image.getAttribute('_src')){
            image.src = image.getAttribute('_src');
        }

        image.style.display = 'inline-block';

        if(image.complete == true){
            //已加载完成
            initRatio(image, ratio);
        } else {
            //加载未完成
            image.parentNode.style.display = 'inline-block';
            image.parentNode.style.overflow = 'hidden';
            image.parentNode.style.width = ratio.width + 'px';
            image.parentNode.style.height = ratio.height + 'px';

            var loading = getLoading(options.loading || defaults.loading, ratio);

            image.parentNode.insertBefore(loading, image);
            image.parentNode.removeChild(image);

            image.onload = function(){
                //加载成功
                initRatio(image, ratio);

                //image.parentNode.style.overflow = 'hidden';
                loading.parentNode.insertBefore(image, loading);
                loading.parentNode.removeChild(loading);
            };

            image.onerror = function(){
                //@todo 加载失败
                console.log('load image failed.');
            }
        }
    }

    window.ratio = ratio;

})(window, document);