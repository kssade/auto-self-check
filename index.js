const https = require("https");
let userdata;
try {
    userdata = require("./data.json");
} catch (e) {
    console.error("데이터파일 불러오기 실패.");
    process.exit(0);
}
// 자가진단서버에 요청하는 함수
function sendjjd(name, data) { // 이름, 데이터
    if (!data.url || !data.token) {
        console.error("데이터가 올바르지 않음.");
        process.exit(0);
    }
    try {
        const req = https.request({ hostname: "eduro." + data.url, path: "/stv_cvd_co01_000.do", port: "443", method: "POST", headers: { "Accept": "application/json, text/javascript, */*; q=0.01", "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" } }, res => {
            res.on('data', body => {
                const result = (JSON.parse(body).resultSVO.rtnRsltCode === "SUCCESS" ? true : false);
                console.log(name, (result ? "성공" : "실패: 잘못된 본인확인 정보"));
            });
        });
        req.write("rtnRsltCode=SUCCESS&qstnCrtfcNoEncpt=" + data.token + "%3D%3D&schulNm=&stdntName=&rspns01=1&rspns02=1&rspns07=0&rspns08=0&rspns09=0"); // 전송할 데이터
        req.end(); // 서버 연결을 종료.
    } catch (e) { // 오류 잡히면
        console.log(name, "실패: 서버에 요청중 오류발생!");
    }
}
try {
    for (var key in userdata) {
        sendjjd(key, userdata[key]);
    }
} catch (e) {
    console.error("데이터가 올바르지 않음.\n" + e);
    process.exit(0);
}