// 存储 日期插件用到的 方法
var getYearMonthDay = function(date) {
    let year  = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    return {
       year, month, day
    }
}
// 获取当前 日期
var getDate = function(year,month,day){
    return new Date(year, month, day)
}

// 处理 年月日 格式 YYYY MM DD
var formatDate = function(year, month, day){
    let y = year;
    // 处理 month
    let m = month + 1;
    m = m < 10 ? '0'+ m : m
    // 处理 day
    let d = day < 10? '0'+ day : day;
    return y + '-' + m + '-' + d
}

let  payUlr = 'http://58.56.128.226:8088';
// 封装一个 async await 的 异步函数   header_token: token  url:是具体接口地址 commonUrl + apiUrl  data: 参数列表
// eg:token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0Yjc3ZDFlODU4ODk0Y2Y3YWMwZjhlYzM2OWFiNDA0MSJ9.IRinAnnE0e5w5p_lz0g0_E5tKBst4F2Xlm0u3QInCSI'
// url: /api/travelerInfo/selectTrevelerSchedul
/**
 * 
 * @param {*} param :header_token url data
 */
function myAjax(param){
    return new Promise((resolve, reject) => {
        $.ajax({
            headers: {
                token: param.header_token  // param 1
            },            
            contentType: 'application/json',
            type: 'POST',
            url: param.url,  // param 2
            data: param.data?JSON.stringify(param.data):null,  // param 3
            dataType: 'json',
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
}

// 分享
function myAjax2(param){
    return new Promise((resolve, reject) => {
        $.ajax({
                       
            contentType: 'application/json',
            type: 'POST',
            url: param.url,  // param 2
            data: param.data?JSON.stringify(param.data):null,  // param 3
            dataType: 'json',
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
}



