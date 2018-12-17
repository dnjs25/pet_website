function initMap() {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      geocodeLatLng(pos);
      weatherRequest(pos);
    });
  }
}

function geocodeLatLng(pos) {
  var input = pos;
  var geocoder = new google.maps.Geocoder;
  geocoder.geocode({'location': input}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        console.log(status);
        city = results[0].address_components[3].long_name;
        county = results[0].address_components[2].long_name;
        village = results[0].address_components[1].long_name;
        console.log(city, county, village);
        // var county = '중랑구';
        // weatherRequest(pos);
        console.log(county);
        fine_dust(county);
        // weatherRequest(city, county, village);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

function fine_dust(county) {
  var gu = county;
  console.log(gu);
  var xhr = new XMLHttpRequest();
  var url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst'; /*URL*/
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '='+'K%2BSsijMhxfNqSbmVK3UyvRSCaRnW5IU6pPqEmkGPB9XZZo6HJvoNcJQ7tDxBQT4FG38dK9bmoYISfGumViwSbQ%3D%3D'; /*Service Key*/
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('25'); /*한 페이지 결과 수*/
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /*페이지 번호*/
  queryParams += '&' + encodeURIComponent('sidoName') + '=' + encodeURIComponent('서울'); /*시도 이름 (서울, 부산, 대구, 인천, 광주, 대전, 울산, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주, 세종)*/
  queryParams += '&' + encodeURIComponent('searchCondition') + '=' + encodeURIComponent('DAILY'); /*요청 데이터기간 (시간 : HOUR, 하루 : DAILY)*/
  queryParams += '&' + encodeURIComponent('_returnType') + '=' + encodeURIComponent('json'); /*요청 데이터 형식 (json) */

  var contents = url + queryParams;
  console.log(contents);
  xhr.open('GET', url + queryParams, true);
  xhr.onreadystatechange = function () {
      if (this.readyState === 4 || xhr.status === 200) {
          // console.log(JSON.stringify(this.getAllResponseHeaders())+' Body: '+this.responseText);
          // console.log(this.responseText);
          var response = JSON.parse(this.responseText);
          console.log(this.responseText);
          // console.log(typeof(response));
          fineDustOutput(response, gu);
      }
      else {
        console.log(this.readyState);
      }
  };
  var x = xhr.send();
  // xhr.send();
  if (x) {
    xhr.abort();
  }
}

function fineDustOutput(response, gu) {
  var res = response;
  var cityName = gu;
  for(var i=0; i<26; i++) {
    if(res.list[i].cityName === gu) {
      var result = res.list[i];
      var cityName = result.cityName;
      var pm10Value = result.pm10Value;
      var pm25Value = result.pm25Value;
      console.log(cityName, pm10Value, pm25Value);
      var changeValue1 = fdValueChange(pm10Value);
      var changeValue2 = fdValueChange(pm25Value);
      console.log(cityName, changeValue1, changeValue2);
      $('.w-drawing').html('현재지역: '+cityName);
      $('.w-finedust').html('미세먼지 등급: '+changeValue1);
      break;
    }
  }
}

function fdValueChange(Value) {
  if (Value === '') {
    Value = '정보없음';
  }
  else if (Value>0 && Value<=30) {
    Value = '좋음';
  }
  else if (Value>=31 && Value<=80) {
    Value = '보통';
  }
  else if (Value>=81 && Value<=150) {
    Value = '나쁨';
  }
  else if (Value>=151) {
    Value = '매우나쁨';
  }

  return Value;
}

// function weatherRequest(city, county, village) {
function weatherRequest(pos) {
  var url = 'https://api2.sktelecom.com/weather/current/minutely'; /*URL*/
  var xhr = new XMLHttpRequest();
  var queryParams = '?' + encodeURIComponent('appKey') + '='+'750555a5-bc7d-4543-8e15-54a9baaf50ba'; /* appKey */
  queryParams += '&' + encodeURIComponent('version') + '=' + encodeURIComponent('1');
  queryParams += '&' + encodeURIComponent('lat') + '=' + encodeURIComponent(pos.lat);
  queryParams += '&' + encodeURIComponent('lon') + '=' + encodeURIComponent(pos.lng);
  // queryParams += '&' + encodeURIComponent('city') + '=' + encodeURIComponent(city);
  // queryParams += '&' + encodeURIComponent('county') + '=' + encodeURIComponent(county);
  // queryParams += '&' + encodeURIComponent('village') + '=' + encodeURIComponent(village);

  xhr.open('GET', url + queryParams, true);
  xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
          var response = JSON.parse(this.responseText);
          console.log(response);
          var weather_data = response['weather']['minutely'][0];
          var sky_data = weather_data['sky']['name'];
          // var time_data = weather_data['timeObservation'];
          // var time_data_s = str(time_data);
          var temp_data_pre = weather_data['temperature']['tc'];
          var temp_data_max = weather_data['temperature']['tmax'];
          var temp_data_min = weather_data['temperature']['tmin'];
          var humidity_data = weather_data['humidity'];

          $('.w-temperature').html("현재 기온은 " + temp_data_pre + "도," + "최저 기온은 " + temp_data_min + "도," + "최고 기온은 " + temp_data_max + "도입니다.");
      }
  };
  var x = xhr.send();
  // xhr.send();
  if (x) {
    xhr.abort();
  }
}
