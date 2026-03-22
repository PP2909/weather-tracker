
  // ── YOUR API KEY ────────────────────────────────────────────────
  const API_KEY = "c3bfa76c7b15c8dc6fa274cf06b6e975";
  // ───────────────────────────────────────────────────────────────

  const ICONS = {
    "01d":"☀️","01n":"🌙","02d":"⛅","02n":"🌥️",
    "03d":"☁️","03n":"☁️","04d":"☁️","04n":"☁️",
    "09d":"🌧️","09n":"🌧️","10d":"🌦️","10n":"🌧️",
    "11d":"⛈️","11n":"⛈️","13d":"❄️","13n":"❄️",
    "50d":"🌫️","50n":"🌫️"
  };

  const DEMO_NOW = {
    name:"New Delhi", sys:{country:"IN"},
    weather:[{main:"Haze",description:"hazy sunshine",icon:"02d"}],
    main:{temp:35.4,feels_like:39.1,humidity:38,pressure:998,temp_min:32,temp_max:38},
    wind:{speed:2.8,deg:195}, visibility:5000, _demo:true
  };
  const DEMO_FC = { list:[
    {dt_txt:"2025-06-01 12:00:00",weather:[{description:"sunny",icon:"01d"}],main:{temp:37}},
    {dt_txt:"2025-06-02 12:00:00",weather:[{description:"partly cloudy",icon:"02d"}],main:{temp:35}},
    {dt_txt:"2025-06-03 12:00:00",weather:[{description:"thunderstorm",icon:"11d"}],main:{temp:28}},
    {dt_txt:"2025-06-04 12:00:00",weather:[{description:"light rain",icon:"10d"}],main:{temp:26}},
    {dt_txt:"2025-06-05 12:00:00",weather:[{description:"clear sky",icon:"01d"}],main:{temp:34}}
  ]};

  const $ = id => document.getElementById(id);

  function windDir(deg){
    return ["N","NE","E","SE","S","SW","W","NW"][Math.round((deg||0)/45)%8];
  }

  function renderCurrent(d){
    const w = d.weather[0], m = d.main;
    $("city-name").textContent = d.name;
    const now = new Date();
    $("country-date").textContent = d.sys.country + "  ·  " +
      now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
    $("weather-icon").textContent = ICONS[w.icon] || "🌤️";
    $("temp").textContent  = Math.round(m.temp) + "°C";
    $("desc").textContent  = w.description;
    $("feels").textContent = `Feels like ${Math.round(m.feels_like)}°C  ·  H:${Math.round(m.temp_max)}° L:${Math.round(m.temp_min)}°`;

    $("mini-stats").innerHTML = [
      {e:"💧", l:"Humidity",   v: m.humidity + "%"},
      {e:"🌬️", l:"Wind",       v: d.wind.speed + " m/s"},
      {e:"🌡️", l:"Pressure",   v: m.pressure + " hPa"},
      {e:"👁️",  l:"Visibility", v: ((d.visibility||0)/1000).toFixed(1) + " km"}
    ].map(s=>`
      <div class="mini-stat">
        <div class="mini-stat-label">${s.e} ${s.l}</div>
        <div class="mini-stat-value">${s.v}</div>
      </div>`).join("");

    $("cond-text").textContent = d._demo
      ? "⚡ Demo mode — add your API key for live weather!"
      : `Live · ${w.main} in ${d.name} · Updated just now`;

    $("big-frame").classList.add("show");
  }

  function renderForecast(data){
    const days = data.list.filter(i => i.dt_txt.includes("12:00:00")).slice(0,5);
    const DN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    $("forecast-list").innerHTML = days.map((d,i) => {
      const label = i===0 ? "Today" : DN[new Date(d.dt_txt).getDay()];
      return `<div class="fc-row" style="animation-delay:${i*0.07}s">
        <div class="fc-left">
          <span class="fc-emoji">${ICONS[d.weather[0].icon]||"🌤️"}</span>
          <div>
            <div class="fc-day">${label}</div>
            <div class="fc-cond">${d.weather[0].description}</div>
          </div>
        </div>
        <div class="fc-temp">${Math.round(d.main.temp)}°C</div>
      </div>`;
    }).join("");
  }

  async function fetchData(city){
    $("error-msg").classList.remove("show");
    $("big-frame").classList.remove("show");
    $("loader").classList.add("show");

    if(!API_KEY.trim()){
      await new Promise(r => setTimeout(r, 900));
      $("loader").classList.remove("show");
      renderCurrent(DEMO_NOW);
      renderForecast(DEMO_FC);
      return;
    }

    try {
      const base = "https://api.openweathermap.org/data/2.5";
      const q = `q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
      const r1 = await fetch(`${base}/weather?${q}`);
      $("loader").classList.remove("show");
      if(r1.status === 401){
        $("error-msg").textContent = "🔑 API key not activated yet! New keys take up to 2 hours. Please wait and try again!";
        $("error-msg").classList.add("show"); return;
      }
      if(r1.status === 404){
        $("error-msg").textContent = "😕 City not found! Check spelling and try again (e.g. Delhi, Mumbai, London)";
        $("error-msg").classList.add("show"); return;
      }
      if(!r1.ok){
        $("error-msg").textContent = "⚠️ Error " + r1.status + " — please try again in a moment.";
        $("error-msg").classList.add("show"); return;
      }
      const r2 = await fetch(`${base}/forecast?${q}`);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      renderCurrent(d1);
      renderForecast(d2);
    } catch(e){
      $("loader").classList.remove("show");
      $("error-msg").textContent = "📡 Network error! Please check your internet and try again.";
      $("error-msg").classList.add("show");
    }
  }

  function getWeather(){
    const c = $("city").value.trim();
    if(!c){ $("city").focus(); return; }
    fetchData(c);
  }

  $("city").addEventListener("keydown", e => { if(e.key==="Enter") getWeather(); });
  fetchData("New Delhi");
