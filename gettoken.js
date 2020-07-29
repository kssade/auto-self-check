const readline = require('readline'), rl = readline.createInterface({ input: process.stdin, output: process.stdout }), https = require("https"), jjdheaders = { 'Accept': 'application/json, text/javascript, */*; q=0.01', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
let city;
function cityname(city) {
    switch (city) {
        case "서울": return "sen.go.kr"
        case "경기": return "goe.go.kr"
        case "대전": return "dje.go.kr"
        case "대구": return "dge.go.kr"
        case "부산": return "pen.go.kr"
        case "인천": return "ice.go.kr"
        case "광주": return "gen.go.kr"
        case "울산": return "use.go.kr"
        case "세종": return "sje.go.kr"
        case "충북": return "cbe.go.kr"
        case "충남": return "cne.go.kr"
        case "경북": return "gbe.kr"
        case "경남": return "gne.go.kr"
        case "강원": return "kwe.go.kr"
        case "전북": return "jbe.go.kr"
        case "전남": return "jne.go.kr"
        case "제주": return "jje.go.kr"
        default: return null;
    }
}
function getschoolname(schoolname, callback) {
    const req = https.request({ hostname: "eduro." + city, path: "/stv_cvd_co00_004.do", port: "443", method: "POST", headers: jjdheaders }, res => {
        res.on('data', body => {
            const result = (JSON.parse(body).resultSVO);
            if ((result.rtnRsltCode === "SUCCESS" ? true : false)) {
                const schoolcode = encodeURIComponent(result.data.schulCode);
                callback(schoolcode);
                console.log("학교 식별번호 가져오기 성공: " + schoolcode);
            } else {
                callback();
                console.log("학교 식별번호 가져오기 실패.");
            }
        });
    });
    req.write("schulNm=" + encodeURIComponent(schoolname)); // 전송할 데이터
    req.end(); // 서버 연결을 종료.
}
function gettoken(schoolcode, schoolname, stuname, birth) {
    const req = https.request({ hostname: "eduro." + city, path: "/stv_cvd_co00_012.do", port: "443", method: "POST", headers: jjdheaders }, res => {
        res.on('data', body => {
            const result = JSON.parse(body).resultSVO;
            if (result.rtnRsltCode == "SUCCESS") {
                console.log("토큰 가져오기 성공:\n" + '"' + stuname + '": ' + '"' + encodeURIComponent((result.qstnCrtfcNoEncpt).replace("==", "")) + '"');
            } else if (result.rtnRsltCode == "ADIT_CRTFC_NO") {
                console.log("토큰 가져오기 실패: " + stuname + "\n동일한 이름을 가진 학생이 있어, 추가정보를 입력바람.");
            } else {
                if (result.rtnRsltCode == "QSTN_USR_ERROR") {
                    console.log("토큰 가져오기 실패: " + stuname + "\n잘못된 본인확인 정보(학교,성명,생년월일)를 입력\n\r확인 후 다시 시도바람.");
                } else if (result.rtnRsltCode == "SCHOR_RFLT_YMD_ERROR") {
                    console.log("토큰 가져오기 실패: " + stuname + "\n학생 건강상태 자가진단 참여가능기간을\n\r확인 후 다시 시도바람.");
                } else {
                    console.log("토큰 가져오기 실패: " + stuname + "\n잘못된 본인확인 정보(" + result.rtnRsltCode + ")\n\r확인 후 다시 시도바람.");
                }
            }
        });
    });
    req.write(encodeURI("qstnCrtfcNoEncpt=&rtnRsltCode=&schulCode=" + schoolcode + "&schulNm=" + schoolname + "&pName=" + stuname + "&frnoRidno=" + birth + "&aditCrtfcNo=")); // 전송할 데이터
    req.end(); // 서버 연결을 종료.
}
console.log("(학교명) (학생이름) (학생주민등록번호 앞자리 6자리)");
rl.on("line", function (line) {
    if (line == "" || (/^ /gi).test(line)) return;
    const argv = line.split(" ");
    if (argv.length !== 3) return console.log("(학교명) (학생이름) (학생주민등록번호 앞자리 6자리)으로 다시 시도하세요!");
    city = cityname(argv[0].substr(0, 2));
    if (city) {
        console.log("사이트 URL 변경: " + city + " [" + argv[0].substr(0, 2) + "]");
        getschoolname(argv[0].substr(2), scode => {
            if (!scode) return console.log("학교 코드를 찾을 수 없음.");
            gettoken(scode, argv[0].substr(2), argv[1], argv[2]);
        });
    } else console.log("학교명 앞에 시도명칭을 같이 입력해주세요!");
});