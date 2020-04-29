// 处理公有的url 和  获取 token
//公共
//token
var header_token = '';
var header_token_test = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0Yjc3ZDFlODU4ODk0Y2Y3YWMwZjhlYzM2OWFiNDA0MSJ9.IRinAnnE0e5w5p_lz0g0_E5tKBst4F2Xlm0u3QInCSI'; //eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0Yjc3ZDFlODU4ODk0Y2Y3YWMwZjhlYzM2OWFiNDA0MSJ9.IRinAnnE0e5w5p_lz0g0_E5tKBst4F2Xlm0u3QInCSI
//url 
var commonURL = 'http://58.56.128.226:6868';  // 公网 地址
var commonURL_zhangzhen = 'http://192.168.1.167:8683' // 张镇 测试 地址



//获取 token(通过截取url参数)
function getToken() {
    
    header_token = window.location.search;
    //console.log(header_token);
    header_token = header_token.slice(1).split('=')[1]; // 285 637需要用到
    // console.log(header_token);

}