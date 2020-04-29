



//公共
//token
var header_token = ''; //ea229b1017594ff488643bc66fc2504a
//url 
//var commonURL = 'http://58.56.128.226:6868';  // 公网 测试地址
//var commonURL = 'http://118.190.156.141';  // 生产 地址
var commonURL ='' // 生产 地址
//var commonURL = 'http://58.56.128.226:6868' // 张镇 测试 地址
//设置 用户信息
var custom = {
    customid: ''
}
// 声明一个blob对象，用来存储待提交的图片文件
var _blob = '';
// 云存储COS
var cos; //云存储实例
var fileDom = ''; //存储input[type=file] 这个dom元素
var ID_imgUrlArr = []; //存储cos成功后的返回的身份证的img url

var guideCard_Arr = []; //存储导游证 img URL
var studentCard_Arr = []; //存储学生证 imgURL

var cosParamObj = { //cos云存储 参数 初始化
    appId: '',
    secretId: '',
    secretKey: '',
    bucket: '',
    region: ''
}
// 存储获取后的数据信息
var travelerInfo = '';

//省市区 三级联动 ：高德API
var districtSearch;

function getProvinceData() {

    //利用高德地图API 获取 所有省
    AMap.plugin('AMap.DistrictSearch', function () {
        districtSearch = new AMap.DistrictSearch({
            // 关键字对应的行政区级别，country表示国家
            level: 'country',
            //  显示下级行政区级数，1表示返回下一级行政区
            subdistrict: 1
        })

        // 搜索所有省/直辖市信息
        districtSearch.search('中国', function (status, result) {
            // 查询成功时，result即为对应的行政区信息
            var dataArr = result.districtList[0].districtList;
            //console.log(result.districtList[0].districtList);
            //省级数据渲染到页面
            renderArea(dataArr, 'province', '省');
        })
    })


}

//用来获得option元素中selected属性为true的元素的区域编码adcode
function Get_Selected_Id(place) {
    //console.log(place);
    //获取省
    var pro = document.getElementById(place);
    var place_name = $(pro.options[pro.selectedIndex]).val().trim();
    //返回 位置名称
    return place_name;
}

//改变下一个级联的option元素的内容，即加载市或县
function Get_Next_Place(This_Place_id, Action) {
    var Selected_name = Get_Selected_Id(This_Place_id); //Selected_Id用来记录当前被选中的省或市的ID
    if (Action == 'Get_city') //从而可以在下一个级联中加载相应的市或县
        Add_city(Selected_name);
    else if (Action == 'Get_country')
        //console.log(Selected_adcode);
        Add_country(Selected_name);
}

//加载城市选项
function Add_city(Province_Selected_name) {

    $("#city").empty();
    $("#country").empty();
    // 搜索所有省/直辖市信息
    districtSearch.search(Province_Selected_name, function (status, result) {
        // 查询成功时，result即为对应的行政区信息
        //市级数据渲染到页面
        var dataArr = result.districtList[0].districtList;
        renderArea(dataArr, 'city', '市');
    })

}

//加载县区选项
function Add_country(City_Selected_name) {
    $("#country").empty();
    //上面的清空与添加是为了保持级联的一致性
    districtSearch.search(City_Selected_name, function (status, result) {
        // 查询成功时，result即为对应的行政区信息
        //市级数据渲染到页面
        var dataArr = result.districtList[0].districtList;
        renderArea(dataArr, 'country', '区');
    })
}

//渲染 城市  至  select 里 (areaArr(Array):城市;id(String):是某个select的id; tip(String) 是指 '省''市''区')
function renderArea(areaArr, id, tip) {
    let optionDom = areaArr.map(function (val) {
        return `
            <option adcode="${val.adcode}">${val.name}</option>
        `
    })
    $("#" + id).append('<option>--' + tip + '--</option>' + optionDom.join(""));
}



// 民族 下拉数据维护
var national = [
    "汉族", "壮族", "满族", "回族", "苗族", "维吾尔族", "土家族", "彝族", "蒙古族", "藏族", "布依族", "侗族", "瑶族", "朝鲜族", "白族", "哈尼族",
    "哈萨克族", "黎族", "傣族", "畲族", "傈僳族", "仡佬族", "东乡族", "高山族", "拉祜族", "水族", "佤族", "纳西族", "羌族", "土族", "仫佬族", "锡伯族",
    "柯尔克孜族", "达斡尔族", "景颇族", "毛南族", "撒拉族", "布朗族", "塔吉克族", "阿昌族", "普米族", "鄂温克族", "怒族", "京族", "基诺族", "德昂族", "保安族",
    "俄罗斯族", "裕固族", "乌孜别克族", "门巴族", "鄂伦春族", "独龙族", "塔塔尔族", "赫哲族", "珞巴族"
];

//初始化 民族 数据
function initNationalData() {
    var nat = document.getElementById("national");
    for (var i = 0; i < national.length; i++) {
        var option = document.createElement('option');
        option.value = i;
        var txt = document.createTextNode(national[i]);
        option.appendChild(txt);
        nat.appendChild(option);
    }
}

// 初始化 职业
var professions = [
    '其他', '学生', '都市白领', '导游', '自由职业' 
]


//COS###： 图片 上传至  腾讯云 并 获取 url 给 后台

// 选择图片
function handleFiles(files, dom) {

    fileDom = dom

    checkPic(files);

}
// 拖拽图片
function handleFiles1(files) {

    checkPic(files);
}
// 获取到图片的名称、大小、图片格式等


// 图片信息校验
function checkPic(files) {
    var fileList = [];
    // 如果只需要单张上传，去掉multiple="multiple"，直接获取数组第1个元素即可file = files[0];
    // 如果是允许多张上传，将上传的图片放入数组中,循环数组
    if (files.length === 0) {
        return
    } else {
        for (var i = 0; i < files.length; i++) {
            fileList.push(files[i]);
        }
    }
    // console.log("先看1：");
    // console.log(fileList[0]);
    //循环待上传的图片
    fileList.forEach((item) => {
        // 1 校验上传图片格式
        if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(item.name)) {
            alert('仅支持png,jpeg,jpg格式图片');
            return
        }
        //校验上传图片大小
        var size = item.size / 1024;
        // if (size < 800) {
        //     //本地展示图片
        //     fileDom.nextElementSibling.src = localShowImg(item);
        //     upload(cosParamObj,item);
        // }else{
        //     //本地展示图片
        //     fileDom.nextElementSibling.src = localShowImg(item);
        //     //图片压缩并转为file文件
        //     begin(item);
        // }
        //本地展示图片
        fileDom.nextElementSibling.src = localShowImg(item);
        //图片压缩并转为file文件
        begin(item);


        //alert('begin')
    })
}

function begin(item){
    var file = item;
    var reader = new FileReader(); //读取文件对象
    reader.readAsDataURL(file);
    reader.onload = function(event){
        var img = new Image()
        var fileType = file.type;
        var quality = 10; //图片品质1-100
        img.src = event.target.result //reader.result、
        console.log('文件的路径')
        console.log(event.target.result)
        console.log('图片')
        console.log(img)
        window.setTimeout(function() {
            var imgObj = compress(img, quality,fileType) //压缩后的图片
            console.log('压缩后的图片')
            console.log(imgObj)
            var src = imgObj.src; //图片的base64格式可以直接当成img的src属性值data/image
//                alert("src:--"+src)
            img.src = src;
            _blob = dataURItoBlob(src); //转二进制
            // alert('看看blob对象')
            // alert(JSON.stringify(_blob))
            // alert(_blob.size)
            // alert(_blob.type)
            // console.log('see blob')
            // console.log(_blob)
            // console.log(file)
//                file.filename = Math.round(Math.random() * 100000000000000, 0) + ".jpg";
            // 调上传接口
            // uploadCos(file)
            upload(cosParamObj, item);
        }, 1)

    }
}
//图片压缩过程
function compress(source_img_obj, quality, output_format) {

    var mime_type = "image/jpeg";
    if(output_format != undefined && output_format == "png") {
        mime_type = "image/png";
    }
    var cvs = document.createElement('canvas');
    //naturalWidth真实图片的宽度
    cvs.width = source_img_obj.naturalWidth;
    cvs.height = source_img_obj.naturalHeight;
//          alert(cvs.width + cvs.height)
    var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0);
    var newImageData = cvs.toDataURL(mime_type, quality / 100);
    var result_image_obj = new Image();

    result_image_obj.src = newImageData;
    return result_image_obj;
}
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for(var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {
        type: mimeString
    });
}

//本地图片展示
function localShowImg(file) {
    var imgURL = '';
    try {
        imgURL = file.getAsDataURL();
    } catch (e) {
        imgRUL = window.URL.createObjectURL(file);
    }
    
    return imgRUL;
}



// 封装原生的ajax
function ajax(opt) {
    opt = opt || {}; //参数对象
    opt.headers = opt.headers || null; // header设置token
    opt.method = opt.method.toUpperCase() || 'POST'; //请求方法
    opt.url = opt.url || ''; //url
    opt.async = opt.async || true; //是否异步
    opt.data = opt.data || null; //有无data
    opt.success = opt.success || function () {}; //返回success
    //XMLHttpRequest 兼容性
    var xmlHttp = null;
    if (XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    } else {
        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    var params = [];
    for (var key in opt.data) {
        params.push(key + '=' + opt.data[key]);
    }
    var postData = params.join('&');
    if (opt.method.toUpperCase() === 'POST') {
        xmlHttp.open(opt.method, opt.url, opt.async);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.setRequestHeader('token', header_token);
        xmlHttp.send(postData);
    } else if (opt.method.toUpperCase() === 'GET') {
        xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
        xmlHttp.send(null);
    }
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            opt.success(xmlHttp.responseText);
        }
    };
}

// 调用ajax
function http() {
    ajax({
        method: 'GET',
        url: 'http://localhost/users/cosV5',
        success: function (res) {
            obj = JSON.parse(res);
            console.info('res', obj)
        }
    })
}
// 这里返回的参数后面new COS 时需要用到。
// obj为上一步请求的配置参数
function upload(obj, file) {
    
    cos = new COS({
        AppId: vm.cosParamObj.appId,
        SecretId: vm.cosParamObj.secretId,
        SecretKey: vm.cosParamObj.secretKey,
    });
    
    var _data_type = $(fileDom).attr('data_type'); //身份证card_1 导游证card_2 学生证card_3
    //console.log(_data_type);
    switch (_data_type) {
        case 'card_1':// 身份证
            _sliceUploadFile_1(obj, file);
            break;
        case 'card_2':// 导游证
            _sliceUploadFile_2(obj, file);
            break;
        case 'card_3':// 学生证
            _sliceUploadFile_3(obj, file);
            break;
        default:
            break;
    }




}

//清空上传控件的值id
function clearInput(ele) {
    //fileDom是全局的file元素
    var demo = fileDom;
    // console.log(demo.value)
    if (demo.outerHTML) {
        demo.outerHTML = demo.outerHTML;

    } else { // FF(包括3.5)
        demo.value = "";
    }
}


//获取腾讯云存储 参数 接口
function getData_COS() {
    ajax({
        headers: {
            token: header_token
        },
        method: 'POST',
        async: false,
        url: commonURL + '/api/live/getCosKey',
        success: function (res) {
            obj = JSON.parse(res);
            if (obj.code == '0000') { //成功的回调
                // console.info('res', obj)

                cosParamObj.appId = obj.data.liveList.Appid;
                cosParamObj.secretId = obj.data.liveList.SecretId;
                cosParamObj.secretKey = obj.data.liveList.SecretKey;
                cosParamObj.bucket = obj.data.liveList.Bucket;
                cosParamObj.region = obj.data.liveList.Region;

                // 创建COS 实例:cos
                cos = new COS({
                    AppId: cosParamObj.appId,
                    SecretId: cosParamObj.secretId,
                    SecretKey: cosParamObj.secretKey,
                });
                //console.log(cos);


            }
        }
    })
}

//var dialog = window.YDUI.dialog; //YDUI 给出的提示样式



//### 成为向导  
//获取用户数据
function getData_travelerInfo() {
    
    ajax({
        method: 'post',
        url: commonURL + '/api/travelerInfo/selectTravelerInfo',
        success: function (data) {
            var data = JSON.parse(data);
            
            //成功
            if (data.code == '0000') {
                
                //设置 customid （全局）
                custom.customid = data.data.travelerInfo[0].customid;
                
                //
                if (data.data.travelerInfo[0].travelerid == null) { //添加

                } else { //修改
                    //数据渲染:成为向导 页面的数据
                    // renderDom_guidePage(data.data.travelerInfo[0]);

                }


            }


        }
    })
}

//数据渲染:成为向导 页面的数据
function renderDom_guidePage(data) {
    //其他（非身份证）证件  图片后缀
    var _Imgindex = data.profession_photo_url.lastIndexOf('.');
    var _suffix = data.profession_photo_url.slice(_Imgindex);

    //判断职业  1学生 3导游 
    //$("#profession_type option:selected").val('')
    $("#profession_type option[value=" + data.profession_type + "]").prop("selected", "selected");
    if (data.profession_type == '1') { //学生
        // alert('学生')
        //显示学校
        $("#item_school").removeClass('card_hidden');
        //显示 学生 隐藏 导游 照片位置
        $("#studentC").removeClass('card_hidden');
        $("#guideC").addClass('card_hidden');

        //显示照片
        var _key = '/studentCard/' + custom.customid + '_01' + _suffix;
        showImg(cosParamObj, _key, '#student_01')

    } else if (data.profession_type == '3') { //导游
        // alert('导游')
        //隐藏学校
        $("#item_school").addClass('card_hidden');
        //显示导游 隐藏 学生 照片位置
        $("#guideC").removeClass('card_hidden');
        $("#studentC").addClass('card_hidden');

        //显示照片
        var _key = '/guideCard/' + custom.customid + '_01' + _suffix;
        showImg(cosParamObj, _key, '#guide_01')

    } else {
        //隐藏 导游和 学生 
        $("#guideC").addClass('card_hidden');
        $("#studentC").addClass('card_hidden');
        //隐藏学校
        $("#item_school").addClass('card_hidden');
    }

    //身份证 正面
    var idcard_img_index01 = data.idcard_front_url.lastIndexOf('.');
    var idcard_01_suffix = data.idcard_front_url.slice(idcard_img_index01);
    //显示身份证 正面照片
    var _key = '/IDcard/' + custom.customid + '_01' + idcard_01_suffix;
    showImg(cosParamObj, _key, '#IDcard_01');

    var idcard_img_index02 = data.idcard_back_url.lastIndexOf('.');
    var idcard_02_suffix = data.idcard_back_url.slice(idcard_img_index02);
    //显示身份证 反面照片
    var _key = '/IDcard/' + custom.customid + '_02' + idcard_02_suffix;
    showImg(cosParamObj, _key, '#IDcard_02');
    console.log(data);

    //角落id  姓名  性别  身高  体重  出生日期  常居住地 详细地址  身份证号  民族 
    $("#up_customid").val(data.up_customid);
    $("#uname").val(data.name);
    $("#usex input[value=" + data.sex + "]").prop('checked', 'checked');
    $("#tall").val(data.tall);
    $("#weight").val(data.weight);
    $("#dateinput").val(data.birthday);
    $("#uaddress").val(data.address);
    $("#uIDcard").val(data.identity_no);
    $("#tele_number").val(data.phone);
    $("#uwechat").val(data.webchat);
    $("#momo").val(data.momo);
    $("#national option[value=" + data.traveler_native + "]").prop("selected", "selected");
    $("#province option[adcode=" + data.province_code + "]").prop("selected", "selected");
    //根据省 初始化 市区
    // 搜索所有省/直辖市信息
    districtSearch.search(data.province, function (status, result) {
        // 查询成功时，result即为对应的行政区信息
        //市级数据渲染到页面
        var dataArr = result.districtList[0].districtList;
        renderArea(dataArr, 'city', '市');
        $("#city option[adcode=" + data.city_code + "]").prop("selected", "selected");
    })
    //上面的清空与添加是为了保持级联的一致性
    districtSearch.search(data.city, function (status, result) {
        // 查询成功时，result即为对应的行政区信息
        //市级数据渲染到页面
        var dataArr = result.districtList[0].districtList;
        renderArea(dataArr, 'country', '区');
        $("#country option[adcode=" + data.area_code + "]").prop("selected", "selected");
    })
   
   

}



// 从cos获取图 并 展示出来
function showImg(obj, key, targetImg) {

    //获取cos 图片               
    cos.getObjectUrl({
        Bucket: obj.bucket,
        Region: obj.region,
        Key: key,
        Sign: true
    }, function (err, data) {
        
        $(targetImg).attr('src', data.Url);
    });
}


//成为向导页面： 提交时的非空验证
function xd_check() {
    //如果职业不是学生，则不讨论学校是否必填、
    if ($("#profession_type option:selected").val() != 1) {
        $("#uschool").removeClass("cell-input");
    } else {
        $("#uschool").addClass("cell-input");
    }
    //普通字段 校验
    $(".cell-input").each(function () {

        //不是
        var val = $(this).val(); //当前元素值
        var _label = $(this).attr('data_label'); //当前待填字段

        if (val == '' || $.trim(val) == '') {
            if ($(this).attr('id') == 'up_customid' || $(this).attr('id') == 'momo') {

            } else {
                //提示必填
                dialog.alert(_label + '必填！');

                //check为false
                check = false;

                //返回
                return false;
            }
        } else if ($(this).attr("id") == 'uIDcard') { //非空时验证一下 身份证
            //获取身份证编号
            var _id = $(this).val();
            //console.log(_id);
            valid_IDcard(_id);
        }


    })
    //下拉选择字段 校验
    //省市区
    var Pro_adcode = $("#province option:selected").attr('adcode');
    var city_adcode = $("#city option:selected").attr('adcode');
    var country_adcode = $("#country option:selected").attr('adcode');
    if (!Pro_adcode || !city_adcode || !country_adcode) {
        //提示必填
        dialog.alert('请完整填写常居住地');
        check = false;
        return false;
    }
}

// 身份证格式校验1
// function valid_IDcard(UUserCard) {
//     var city = {
//         11: "北京",
//         12: "天津",
//         13: "河北",
//         14: "山西",
//         15: "内蒙古",
//         21: "辽宁",
//         22: "吉林",
//         23: "黑龙江 ",
//         31: "上海",
//         32: "江苏",
//         33: "浙江",
//         34: "安徽",
//         35: "福建",
//         36: "江西",
//         37: "山东",
//         41: "河南",
//         42: "湖北 ",
//         43: "湖南",
//         44: "广东",
//         45: "广西",
//         46: "海南",
//         50: "重庆",
//         51: "四川",
//         52: "贵州",
//         53: "云南",
//         54: "西藏 ",
//         61: "陕西",
//         62: "甘肃",
//         63: "青海",
//         64: "宁夏",
//         65: "新疆",
//         71: "台湾",
//         81: "香港",
//         82: "澳门",
//         91: "国外 "
//     };
//
//     var tip = "";
//     var pass = true;
//     var year = UUserCard.substr(6, 4);
//     var mounth = UUserCard.substr(10, 2);
//     var day = UUserCard.substr(12, 2);
//     if (!UUserCard || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(UUserCard)) {
//         tip = "身份证号格式错误";
//         pass = false;
//     } else if (!city[UUserCard.substr(0, 2)]) {
//         tip = "地址编码错误";
//         pass = false;
//     }
//
//     if (((year % 400 == 0) || year % 100 != 0) && year % 4 == 0) {
//         if (mounth == '02') {
//             if (day * 1 > 29) {
//                 pass = false;
//             }
//         }
//     } else {
//         if (mounth == '02') {
//             if (day * 1 > 28) {
//                 pass = false;
//             }
//         }
//     }
//     //18位身份证需要验证最后一位校验位
//     if (UUserCard.length == 18) {
//         code = UUserCard.split('');
//         //∑(ai×Wi)(mod 11)
//         //加权因子
//         var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
//         //校验位
//         var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
//         var sum = 0;
//         var ai = 0;
//         var wi = 0;
//         for (var i = 0; i < 17; i++) {
//             ai = code[i];
//             wi = factor[i];
//             sum += ai * wi;
//         }
//         var last = parity[sum % 11];
//         if (parity[sum % 11] != code[17]) {
//             tip = "请输入正确的身份证号";
//             pass = false;
//         }
//     }
//     if (!pass) {
//         //校验失败  填写你要做的内容
//         check = false;
//         return false;
//     };
//     return true
// }
// 身份证格式校验

//身份证校验2
function valid_IDcard(val) {
    var p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
    var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
    var code = val.substring(17);
    if(p.test(val)) {
        var sum = 0;
        for(var i=0;i<17;i++) {
            sum += val[i]*factor[i];
        }
        if(parity[sum % 11] == code.toUpperCase()) {
            return true;
        }
    }
    return false;
}


//COS 上传功能 身份证
function _sliceUploadFile_1(obj, file) { //_1 身份证
    //自定义key的格式
    var _key = set_COSImgKey(file);
    vm.showLoading2 = true
    
    cos.sliceUploadFile({
        Bucket: vm.cosParamObj.bucket,
        Region: vm.cosParamObj.region,
        Key: _key, //上传的文件夹和图片名称
        Body: _blob, //要上传的文件 file
        onProgress: function (progressData) {
            /* 上传进度 */
            // console.log(progressData);
            // alert(JSON.stringify(progressData))
        }
    }, function (err, data) {
        if(!err && data){  //为解决bug多上传一遍
            cos.sliceUploadFile({
                Bucket: vm.cosParamObj.bucket,
                Region: vm.cosParamObj.region,
                Key: _key, //上传的文件夹和图片名称
                Body: _blob, //要上传的文件 file
                onProgress: function (progressData) {
                    /* 上传进度 */
                    // console.log(progressData);
                    // alert(JSON.stringify(progressData))
                }
            }, function (err, data) {
                if (data.statusCode == 200) { // 上传成功返回url
//                	alert(data)
                    //截取url
                    //console.log(data);
                    var _i = data.Location.lastIndexOf('IDcard/');
                    var _imgURL = data.Location.slice(_i);
                    //存储imgUrl
                    var index = +($(fileDom).attr('num'));
                    ID_imgUrlArr[index] = _imgURL;
                    //console.log(ID_imgUrlArr)
                    // 需要清空上传控件
                    // 传给页面中的属性
                    vm.idcard_imgArr = ID_imgUrlArr;
                    clearInput('file');
                    vm.showLoading2 = false;
                    vm.$toast('身份证上传成功')
                    vm.is_upload_idcard = true

                }else{
                    vm.showLoading2 = false
                    // 长传失败
                    vm.$toast('身份证上传失败')
                    vm.is_upload_idcard = false
                }
            })
        }else{
            vm.showLoading2 = false
            // 长传失败
            vm.$toast('身份证上传失败')
            vm.is_upload_idcard = false
        }


    });
}
//COS 上传功能 导游证
function _sliceUploadFile_2(obj1, file) { //_2 导游证
    let obj =vm.cosParamObj;
    //自定义key的格式
    var _key = set_COSImgKey(file);
    //console.log("xxxx" + _key);
    vm.showLoading2 = true
    cos.sliceUploadFile({
        Bucket: obj.bucket,
        Region: obj.region,
        Key: _key, //上传的文件夹和图片名称
        Body: _blob, //要上传的文件
        onProgress: function (progressData) {
            /* 上传进度 */
            // console.log(progressData);
        }
    }, function (err, data) {
        if(!err && data){ // 传两遍
            cos.sliceUploadFile({
                Bucket: obj.bucket,
                Region: obj.region,
                Key: _key, //上传的文件夹和图片名称
                Body: _blob, //要上传的文件
                onProgress: function (progressData) {
                    /* 上传进度 */
                    // console.log(progressData);
                }
            }, function (err, data) {
                if (data.statusCode == 200) { // 上传成功返回url
                    //截取url
                    var _i = data.Location.lastIndexOf('guideCard/');
                    var _imgURL = data.Location.slice(_i);
                    //存储imgUrl
                    var index = +($(fileDom).attr('num'));
                    guideCard_Arr[index] = _imgURL;

                    // 需要清空上传控件
                    vm.guidecard_imgArr = guideCard_Arr;
                    clearInput('file');
                    vm.showLoading2 = false
                    vm.$toast('导游证上传成功')
                    vm.is_upload_guider = true
                }else{
                    vm.showLoading2 = false
                    vm.$toast('导游证上传失败')
                    vm.is_upload_guider = false
                }
            })
        }else{
            vm.showLoading2 = false
            vm.$toast('导游证上传失败')
            vm.is_upload_guider = false
        }


    });
}
//COS 上传功能 学生证
function _sliceUploadFile_3(obj1, file) { // _3 学生证
    let obj = vm.cosParamObj;
    //自定义key的格式
    var _key = set_COSImgKey(file);
    //console.log(_key);
    vm.showLoading2 = true
    cos.sliceUploadFile({
        Bucket: obj.bucket,
        Region: obj.region,
        Key: _key, //上传的文件夹和图片名称
        Body: _blob, //要上传的文件
        onProgress: function (progressData) {
            /* 上传进度 */
            // console.log(progressData);
        }
    }, function (err, data) {
        if(!err && data){
            cos.sliceUploadFile({
                Bucket: obj.bucket,
                Region: obj.region,
                Key: _key, //上传的文件夹和图片名称
                Body: _blob, //要上传的文件
                onProgress: function (progressData) {
                    /* 上传进度 */
                    // console.log(progressData);
                }
            }, function (err, data) {
                if (data.statusCode == 200) { // 上传成功返回url
                    //截取url
                    var _i = data.Location.lastIndexOf('studentCard/');
                    var _imgURL = data.Location.slice(_i);
                    //存储imgUrl
                    var index = +($(fileDom).attr('num'));
                    studentCard_Arr[index] = _imgURL;
                    // console.log(studentCard_Arr);
                    // 需要清空上传控件
                    vm.studentcard_imgArr = studentCard_Arr;
                    clearInput('file');
                    vm.showLoading2 = false
                    vm.$toast('学生证上传成功')
                    vm.is_upload_student = true
                }else{
                    vm.showLoading2 = false
                    vm.$toast('学生证上传失败')
                    vm.is_upload_student = false
                }
            })
        }else{
            vm.showLoading2 = false
            vm.$toast('学生证上传失败')
            vm.is_upload_student = false
        }


    });
}

//自定义 COS图片上传时 key 的格式
function set_COSImgKey(file) {
    console.log('自定义key')
    console.log(file)
    //取后缀
    var _suffix = file.name.slice(file.name.lastIndexOf('.'));
    
    //customid
    
    var _customid = custom.customid;

    //身份证 导游证 学生证
    var data_type = $(fileDom).attr("data_type");

    if (data_type == 'card_1') { //身份证
        //判断正反面
        var _num = $(fileDom).attr('num');
        //设置key
        var _key;
        if (_num == '0') {
            _key = 'IDcard/' + _customid + '_01' + _suffix;
            return _key;
        } else if (_num == '1') {
            _key = 'IDcard/' + _customid + '_02' + _suffix;
            return _key;
        }
    } else if (data_type == 'card_2') { //导游证
        var _key = '/guideCard/' + _customid + '_01' + _suffix;
        return _key;
    } else if (data_type == 'card_3') { //学生证
        var _key = '/studentCard/' + _customid + '_01' + _suffix;
        return _key;
    }

}



//成为向导页面： 职业的  change  事件
function changeProfession_type() {
    var _val = $("#profession_type option:selected").val();
    console.log(_val);
    // 1 : 学生
    if (_val == 1) {
        $("#guideC").addClass("card_hidden");
        $("#studentC").removeClass('card_hidden');
        //展示学校
        $("#item_school").removeClass("card_hidden");
    } else if (_val == 3) { // 3: 导游
        $("#studentC").addClass("card_hidden");
        $("#guideC").removeClass('card_hidden');
        //隐藏学校
        $("#item_school").addClass("card_hidden");
    } else {
        $("#guideC").addClass("card_hidden");
        $("#studentC").addClass('card_hidden');
        //隐藏学校
        $("#item_school").addClass("card_hidden");
    }
}


//成为向导页面： 提交 事件
function toBe_wizard() {
    // 验证
    var check = true;
    xd_check();
    if (check) {
        // alert('111');
        //禁用
        $(this).attr('disabled', true);
        //省 名称 和 编码 
        var pro_val = $("#province option:selected").val();
        var Pro_adcode = $("#province option:selected").attr('adcode');

        //市 名称 和 编码 
        var city_val = $("#city option:selected").val();
        var city_adcode = $("#city option:selected").attr('adcode');

        //区 名称 和 编码 
        var country_val = $("#country option:selected").val();
        var country_adcode = $("#country option:selected").attr('adcode');

        //职业证照片 url
        var profession_photo_url = '';
        var guide = 0;
        var _profession_type = $("#profession_type option:selected").val();
        if (_profession_type == 1) {
            profession_photo_url = studentCard_Arr[0];
            guide = 0;
        } else if (_profession_type == 3) {
            profession_photo_url = studentCard_Arr[0];

            //是否是导游
            guide = 1;
        } else {
            profession_photo_url = '';
            guide = 0;
        }



        var data = {


            up_customid: $("#up_customid").val(),
            address: $("#uaddress").val(),
            // 区
            area: country_val,
            area_code: country_adcode,

            birthday: $("#dateinput").val(),
            // 市
            city: city_val,
            city_code: city_adcode,

            guide: 0,
            identity_no: $("#uIDcard").val(),
            //目前是身份证
            identity_type: 1,
            name: $("#uname").val(),
            phone: $("#tele_number").val(),
            profession_type: $("#profession_type option:selected").val(),
            // 省
            province: pro_val,
            province_code: Pro_adcode,

            sex: $("#usex input[type=radio]:checked").val(),
            tall: $("#tall").val(),
            traveler_earn_month: getDate_YYYYMM(),
            traveler_native: $("#national option:selected").val(),
            // traveler_photo_url: '1111',
            webchat: $("#uwechat").val(),
            weight: $("#weight").val(),
            momo: $("#momo").val(),
            // 身份证 url
            idcard_back_url: ID_imgUrlArr[0],
            idcard_front_url: ID_imgUrlArr[1],
            //是否是导游
            profession_photo_url: profession_photo_url,
            guide: guide

        };
        //console.log(JSON.stringify(data));
        $.ajax({
            headers: {
                token: header_token
            },
            contentType: 'application/json',
            type: 'POST',
            url: commonURL + '/api/travelerInfo/addTravelerInfo',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (data) {
                console.log(data);
                if(data.code == '0000'){
                    $(this).attr('disabled', false);
                }
                
            }
        })
    }

}



//获取当前 年月  YYYYMM
function getDate_YYYYMM() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" + month : month);
    var mydate = (year.toString() + month.toString());
    return mydate;
}

//获取 token
function getToken() {
    var token_id = ''

   var  header_token1 = window.location.search;
    header_token1 = header_token1.slice(1).split('&'); // 285 637需要用到
    for(var item of header_token1){
        if(item.indexOf('token')>-1){
            token_id = item.split('=')[1]
        }
    }
    header_token = token_id
}
//获取 commonURL
function getCommonURL() {
    var url_id = ''
    var commonURL1 = window.location.search;
    //console.log(header_token);
    commonURL1 = commonURL1.slice(1).split('&'); // 285 637需要用到
    for(var item of commonURL1){
        if(item.indexOf('commonURL')>-1){
            url_id = item.split('=')[1]
        }
    }
    commonURL = 'http://'+url_id;
}
//获取 customid
function getCustomid() {
    var pre_id = ''
    var customid = window.location.search;
    //console.log(header_token);
    customid = customid.slice(1).split('&'); // 285 637需要用到
    for(var item of customid){
        if(item.indexOf('customid')>-1){
            pre_id = item.split('=')[1]
        }
    }
    custom.customid  = pre_id;
    // return pre_id;
}
let money = 0;
// 获取 money
function getMoney(){
    let str = window.location.search;
    let arr = str.slice(1).split('&');
    let targetStr = '';
    let targetToken = '';
    for(let item of arr){
        if(item.indexOf('money')>-1){
            targetStr = item;
        }
    }
    for(let val of arr){
        if(val.indexOf('token')>-1){
            targetToken = val;
        }
    }
    header_token = targetToken.split('=')[1];
    return targetStr.split('=')[1]
}
// 针对 pay_2.html
    function getPayMoney(){
        let obj = {}
        let str = window.location.search;
        let arr = str.slice(1).split('&');
        //let arr = ["token=1111111", "allOrderids=1", "allPices=0", "travelerTime=1", "travelerCustomid=1", "payType=1"];
        for(let item of arr){
            let _arr = item.split('=');
            obj[_arr[0]] = _arr[1]
        }
        return obj;
// console.log(obj)
    }
