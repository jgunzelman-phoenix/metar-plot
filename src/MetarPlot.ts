import { METAR } from "./Metar";
import { getWeatherSVG } from "./Weather"
/**
 * Extracted Metar message
 */
export class MetarPlot {
    public visablity?: number;
    public temp?: number;
    public dew_point?: number;
    public station?: string;
    public wind_direction?: number;
    public wind_speed?: number;
    public gust_speed?: number;
    public pressure?: number;
    public ceiling?: number;
    public wx?: string;
    public condition?: string;
}

const GUST_WIDTH = 2;
const WS_WIDTH = 4;

/**
 * Turns a raw METAR to an SVG image
 * @param rawMetar RAW metar
 * @param width css width of svg
 * @param height css height of svg
 * @returns 
 */
export function rawMetarToSVG(rawMetar: string, width: string, height: string): string {
    let plot = rawMetarToMetarPlot(rawMetar)
    return metarToSVG(plot, width, height);
}

export function rawMetarToMetarPlot(rawMetar: string): MetarPlot{
    let metar = new METAR(rawMetar);
    let wx = metar.weather.map(weather => weather.abbreviation).join("");

    //Set Pressure
    let pressure = metar.altimeterInHpa?.toString()
    pressure = pressure == null ? "" : pressure.replace("\.","").substr(1,pressure.length)

    return { 
                visablity: metar.visibility,
                temp: metar.temperature,
                dew_point: metar.dewpoint,
                station: metar.station,
                wind_direction: (typeof metar.wind.direction === "number") ? metar.wind.direction : undefined,
                wind_speed: metar.wind.speed,
                gust_speed: metar.wind.gust,
                wx: wx,
                pressure: Number.parseInt(pressure)
            }
}

/**
 * Turns a Metar plot object to a SVG image
 * @param metar MetarPlot Object
 * @param width css width for svg
 * @param height css height for svg
 * @returns 
 */
export function metarToSVG(metar: MetarPlot, width: string, height: string): string {
    const VIS = metar.visablity ?? ""
    const TMP = metar.temp ?? ""
    const DEW = metar.dew_point ?? ""
    const STA = metar.station ?? ""

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 500 500">
                <style>
                    .txt{ font-size: 47.5px; font-family: sans-serif; }
                    .tmp{ fill: red; }
                    .sta{ fill: grey }
                    .dew{ fill: blue }
                    .vis{ fill: violet }
                </style>
                ${genWind(metar)}
                ${getWeatherSVG(metar.wx ?? "")}
                <g id="text">
                    <text class="vis txt" fill="#000000" stroke="#000" stroke-width="0" x="80"   y="260" text-anchor="start" xml:space="preserve">${VIS}</text>
                    <text class="tmp txt" fill="#000000" stroke="#000" stroke-width="0" x="160"  y="220" text-anchor="start" xml:space="preserve" >${TMP}</text>
                    <text class="dew txt" fill="#000000" stroke="#000" stroke-width="0" x="160"  y="315" text-anchor="start" xml:space="preserve">${DEW}</text>
                    <text class="sta txt" fill="#000000" stroke="#000" stroke-width="0" x="270"  y="315" text-anchor="start" xml:space="preserve">${STA}</text>
                    <text class="alt txt" fill="#000000" stroke="#000" stroke-width="0" x="270"  y="220"  text-anchor="start" xml:space="preserve">${""}</text>
                </g>
            </svg>`
}

/**
 * Creates a windbarb for the metar
 * @param metar 
 * @returns 
 */
function genWind(metar: MetarPlot): string {
    const WDD = metar.wind_direction ? metar.wind_direction : 0
    const WSP = metar.wind_speed ? metar.wind_speed : 0
    let wind = ""
    let gust = ""
    if (WSP === 0) {
        wind =
            `<g id="calm">
                <ellipse id="calm-marker" stroke="#000" fill="#00000000" cx="250" cy="250" rx="35" ry="35"/>
            </g>`
    } else {
        gust = metar.gust_speed == null ? "" :
            `<g id="gustBarb" transform="rotate(${WDD}, 250, 250)">
                ${genBarb1(metar.gust_speed ?? 0, true)}
                ${genBarb2(metar.gust_speed ?? 0, true)}
                ${genBarb3(metar.gust_speed ?? 0, true)}
                ${genBarb4(metar.gust_speed ?? 0, true)}
                ${genBarb5(metar.gust_speed ?? 0, true)}
            </g>`
        wind =
            `<g id="windBard" transform="rotate(${WDD}, 250, 250)">
                <line stroke-width="3" y1="230" x1="250" y2="50" x2="250"  stroke="#000" fill="none" />
                ${genBarb1(metar.wind_speed ?? 0, false)}
                ${genBarb2(metar.wind_speed ?? 0, false)}
                ${genBarb3(metar.wind_speed ?? 0, false)}
                ${genBarb4(metar.wind_speed ?? 0, false)}
                ${genBarb5(metar.wind_speed ?? 0, false)}
            </g>`
    }
    return gust + wind;
}

/**
 * Generate first barb
 * @param speed wind or gust speed
 * @param gust set to true for gust
 * @returns 
 */
function genBarb1(speed: number, gust: boolean): string {
    const fill = gust ? 'red' : '#000'
    const tag = gust ? 'gs' : 'ws'
    const width = gust ? GUST_WIDTH : WS_WIDTH
    let barb = ""
    if (speed >= 10 && speed < 50) {
        barb = `<line id="${tag}-bard-1-long" stroke-width="${width}" y1="50" x1="250" y2="50" x2="300" stroke="${fill}" transform="rotate(-35, 250, 50)"/>`
    } else if (speed >= 50) {
        barb = `<polygon id="${tag}-bard-1-flag" points="248,60 290,30 248,30" fill="${fill}" />`
    }
    return barb
}
/**
 * Generate second barb
 * @param speed wind or gust speed
 * @param gust set to true for gust
 * @returns 
 */
function genBarb2(speed: number, gust: boolean): string {
    const fill = gust ? 'red' : '#000'
    const tag = gust ? 'gs' : 'ws'
    const width = gust ? GUST_WIDTH : WS_WIDTH
    let barb = ""
    if ((speed < 10) || (15 <= speed && speed < 20) || (55 <= speed && speed < 60)) {
        barb = `<line id="${tag}-bard-2-short" stroke-width="${width}" y1="70" x1="250" y2="70" x2="275" stroke="${fill}" transform="rotate(-35, 250, 70)"/>`
    } else if ((15 < speed && speed < 50) || (speed >= 60)) {
        barb = `<line id="${tag}-bard-2-long" stroke-width="${width}" y1="70" x1="250" y2="70" x2="300" stroke="${fill}" transform="rotate(-35, 250, 70)"/>`
    }
    return barb
}
/**
 * Generate third barb
 * @param speed wind or gust speed
 * @param gust set to true for gust
 * @returns 
 */
function genBarb3(speed: number, gust: boolean): string {
    const fill = gust ? 'red' : '#000'
    const tag = gust ? 'gs' : 'ws'
    const width = gust ? GUST_WIDTH : WS_WIDTH
    let barb = ""
    if ((25 <= speed && speed < 30) || (65 <= speed && speed < 70)) {
        barb = `<line id="${tag}-bard-3-short" stroke-width="${width}" y1="90"  x1="250" y2="90" x2="275" stroke="${fill}" transform="rotate(-35, 250, 90)"/>`
    } else if ((25 < speed && speed < 50) || speed >= 70) {
        barb = `<line id="${tag}-bard-3-long" stroke-width="${width}" y1="90"  x1="250" y2="90" x2="300" stroke="${fill}" transform="rotate(-35, 250, 90)"/>`
    }
    return barb
}
/**
 * Generate forth barb
 * @param speed wind or gust speed
 * @param gust set to true for gust
 * @returns 
 */
function genBarb4(speed: number, gust: boolean): string {
    const fill = gust ? 'red' : '#000'
    const tag = gust ? 'gs' : 'ws'
    const width = gust ? GUST_WIDTH : WS_WIDTH
    let barb = ""
    if ((35 <= speed && speed < 40) || (75 <= speed && speed < 80)) {
        barb = `<line id="${tag}-bard-4-short" stroke-width="${width}" y1="110" x1="250" y2="110" x2="275"  stroke="${fill}" transform="rotate(-35, 250, 110)"/>`
    } else if ((35 < speed && speed < 50) || speed >= 80) {
        barb = `<line id="${tag}-bard-4-long" stroke-width="${width}" y1="110" x1="250" y2="110" x2="300"  stroke="${fill}" transform="rotate(-35, 250, 110)"/>`
    }
    return barb
}
/**
 * Generate fifth barb
 * @param speed wind or gust speed
 * @param gust set to true for gust
 * @returns 
 */
function genBarb5(speed: number, gust: boolean): string {
    const fill = gust ? 'red' : '#000'
    const tag = gust ? 'gs' : 'ws'
    const width = gust ? GUST_WIDTH : WS_WIDTH
    let brab = ""
    if ((45 <= speed && speed < 50) || (85 <= speed && speed < 90)) {
        brab = `<line id="${tag}-bard-5-short" stroke-width="${width}" y1="130" x1="250" y2="130" x2="275"  stroke="${fill}" transform="rotate(-35, 250, 130)"/>`
    }
    return brab
}