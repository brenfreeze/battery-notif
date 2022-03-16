import { useState, useEffect } from "react";
import { animated, useSpring } from "react-spring";
import moment from "moment";
import {initNotifications, notify} from 'browser-notification';

export default function Home() {
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [charging, setCharging] = useState(false);
  const [chargingTime, setChargingTime] = useState(0);

  const [{ xy }, set] = useSpring(() => ({
    xy: [0, 0],
    config: { mass: 10, tension: 550, friction: 140 },
  }));

  const batteryListener = async () => {
    try {
      const battery = await navigator.getBattery();

      setCharging(battery.charging);
      setBatteryLevel(battery.level);

      battery.addEventListener("chargingchange", () => {
        setCharging(battery.charging);
      });

      battery.addEventListener("levelchange", () => {
        setBatteryLevel(battery.level);
      });

      battery.addEventListener("chargingtimechange", () => {
        setChargingTime(battery.chargingTime);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const transformedChargingTime = moment
    .duration(chargingTime, "seconds")
    .asMinutes();

  const batteryPercent = Math.ceil(batteryLevel * 100);

  let calc

  if (typeof window !== 'undefined') {
    calc = (x, y) =>
    `translate3d(${(0 - x - window.innerWidth) / 20}px, ${
      (0 - y - window.innerHeight) / 20
    }px, 0)`;
  }
  
  const transformValue = calc => {
    try {
      return xy.to(calc)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const doodle = document.querySelector('css-doodle')

    doodle.update()
  }, [charging])

  useEffect(() => {
    batteryListener();
  }, []);

  useEffect(() => {
    initNotifications()
  }, [])


  return (
    <>
      <div
        className="relative grid min-h-screen place-content-center"
        onMouseMove={({ clientX: x, clientY: y }) => {
          return set({ xy: [x, y] });
        }}
      >
        <h1 className="font-bold text-center text-9xl">{batteryPercent}%</h1>
        {charging && chargingTime !== Infinity && (
          <h3 className="text-5xl font-bold text-center">
            {transformedChargingTime} minutes to full charge
          </h3>
        )}
        <div
          className={`absolute inset-x-0 bottom-0 transition-all duration-[1000ms] ease-in-out ${
            charging ? "bg-green-300" : "bg-yellow-200"
          }  -z-10 overflow-hidden`}
          style={{ height: `${batteryPercent}%` }}
        >
          <animated.div style={{ transform: transformValue(calc) }}>
            <css-doodle>
              {`:doodle {
                  @grid: @rand(512, 1024) / 200vmax;
                }
                  
                ${charging ? '' : 'transform: rotate(@pick(90deg, 180deg, 270deg, 360deg));'}
                overflow: hidden;
                position: relative;
                transition: 1000ms @r(600ms) ease;
                
                
                :before {
                  @use: var(--truchet);
                  @use: var(--truchet-a);
                }
                
                :after {
                  @use: var(--truchet);
                  @use: var(--truchet-b);
                }`}
            </css-doodle>
          </animated.div>
        </div>
      </div>
    </>
  );
}
