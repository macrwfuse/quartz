import { componentRegistry } from "../../../../components/registry.js"

// LocationWeather 组件
const LocationWeather = ({ displayClass }) => {
  return {
    type: "div",
    props: {
      class: `location-weather ${displayClass ?? ""}`,
      children: [
        {
          type: "div",
          props: {
            class: "lw-container",
            id: "lw-data",
            children: "加载中..."
          }
        }
      ]
    }
  }
}

LocationWeather.css = `
.location-weather {
  margin: 0 0 1rem 0;
  padding: 0;
}

.lw-container {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 0.85rem;
  color: var(--darkgray);
  flex-wrap: wrap;
}

.lw-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.lw-icon {
  font-size: 1rem;
  line-height: 1;
}

.lw-loading {
  color: var(--gray);
  font-size: 0.8rem;
}

.lw-error {
  color: var(--gray);
  font-size: 0.8rem;
}
`

LocationWeather.afterDOMLoaded = `
(function() {
  async function loadLWData() {
    const el = document.getElementById('lw-data');
    if (!el) return;
    
    try {
      // 获取 IP 和位置信息
      const ipRes = await fetch('https://ipinfo.io/json');
      const ipData = await ipRes.json();
      
      const ip = ipData.ip || '未知';
      const city = ipData.city || '';
      const region = ipData.region || '';
      const country = ipData.country || '';
      const location = [city, region, country].filter(Boolean).join(', ');
      
      // 获取天气信息
      let weather = '';
      let temp = '';
      let weatherIcon = '🌤️';
      try {
        const weatherRes = await fetch('https://wttr.in/' + city + '?format=j1');
        const weatherData = await weatherRes.json();
        const current = weatherData.current_condition[0];
        temp = current.temp_C + '°C';
        
        const desc = current.lang_zh && current.lang_zh[0] 
          ? current.lang_zh[0].value 
          : current.weatherDesc[0].value;
        weather = desc;
        
        const code = parseInt(current.weatherCode);
        if (code === 113) weatherIcon = '☀️';
        else if (code >= 116 && code <= 122) weatherIcon = '⛅';
        else if (code >= 176 && code <= 263) weatherIcon = '🌧️';
        else if (code >= 266 && code <= 314) weatherIcon = '🌧️';
        else if (code >= 317 && code <= 395) weatherIcon = '🌨️';
        else weatherIcon = '🌤️';
      } catch (e) {
        weather = '获取失败';
      }
      
      // 更新显示
      el.className = 'lw-container';
      el.innerHTML = 
        '<span class="lw-item"><span class="lw-icon">🌐</span>' + ip + '</span>' +
        '<span class="lw-item"><span class="lw-icon">📍</span>' + location + '</span>' +
        '<span class="lw-item"><span class="lw-icon">' + weatherIcon + '</span>' + weather + ' ' + temp + '</span>';
      
    } catch (e) {
      el.className = 'lw-error';
      el.textContent = '无法获取位置信息';
    }
  }
  
  // 页面加载后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLWData);
  } else {
    loadLWData();
  }
  
  // SPA 导航时重新加载
  document.addEventListener('nav', loadLWData);
})();
`

// 注册组件
componentRegistry.register("LocationWeather", LocationWeather, "./quartz/plugins/local/location-weather")

export const manifest = {
  name: "location-weather",
  displayName: "Location Weather",
  description: "显示当前网络IP、地区和天气预报",
  version: "1.0.0",
  category: "component",
  quartzVersion: ">=5.0.0",
  defaultOrder: 5,
  defaultEnabled: true,
  defaultOptions: {},
  components: {
    LocationWeather: {
      displayName: "Location Weather",
      defaultPosition: "header",
      defaultPriority: 5
    }
  }
}

export default LocationWeather
