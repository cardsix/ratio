# Radio
原始尺寸（比例）无压缩、变形缩放图片

## 原理
设定父元素固定宽高并且**overflow: hidden**，内部图片元素以原始比例缩放至父元素宽或高，对应另一个属性设置为**auto**。

## 流程
1. **获取图片**，初始化图片容器为自定义比例宽高
2. **缓存图片**，并**替换**图片为loading图片
3. **加载图片**，加载完成后获取图片原始尺寸
    * 加载成功：获取图片原始尺寸
    * 加载失败：TODO
4. 依据**自定义**比例尺寸和图片**原始**尺寸，计算图片**实际**显示尺寸（CSS宽高）
    * 原始比例 > 定义比例
    * 原始比例 < 定义比例
5. **替换loading图片为原图片**

## 参数
    dom Object
    options: {
        ratio: {
            width: number,
            height: number,
        },
        loading: string,
        callback: {
            mouseOver: function,
            mouseOut: function,
            error: function
        }
    }

## 示例
    <div class="example"
        <a href="#" style=""><img _src="http://www.benbenla.cn/images/20120330/benbenla-04b.jpg" style="width :200px;height: 200px;" /></a>
        <a href="#"><img _src="http://imgstore.cdn.sogou.com/app/a/11220002/4348_pc.jpg" class="text" /></a>
        <a href="#"><img _src="http://www.deskcar.com/desktop/cartoon/china/2012317210314/17.jpg" width="10000"></a>
        <a href="#"><img _src="http://pic1.ooopic.com/uploadfilepic/sheying/2009-01-04/OOOPIC_z19870212_20090104b18ef5b046904933.jpg" /></a>
        <a href="#"><img _src="http://5.26923.com/download/pic/000/245/718dfc8322abe39627591e4a495767af.jpg" /></a>
        <a href="#"><img _src="http://img3.imgtn.bdimg.com/it/u=67352308,2479390457&fm=21&gp=0.jpg" /></a>
        <a href="#"><img _src="http://rescdn.qqmail.com/dyimg/20140409/72B8663B7F23.jpg" /></a></a>
        <a href="#"><img _src="http://img1.imgtn.bdimg.com/it/u=3602991495,3673804&fm=21&gp=0.jpg" /></a>
        <a href="#"><img _src="http://www.error.com/error.jpg" /></a>
    </div>

__

    var images = document.qureySelectorAll('.examle img');
    var i = 0;

    while(image[i]){
        ratio(image[i], {
            ratio: {
                width: 300,
                height: 185.41
            },
            loading: 'loading.gif',
            callback: {
                mouseOver: function(image){
                    //do some thing
                },
                mouseOut: function(image){
                    //do some thing
                },
                error: function(image){
                    //do some thing
                }
        }
        i++;
    }
