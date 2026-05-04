"use client";

import { LogoScrap } from "@/components/logo-scrap";
import { PersonalScrap } from "@/components/personal-scrap";
import {
  ArrowUpRight, GithubLogo, LinkedinLogo, Envelope, CaretDown, GameController, SuitcaseSimple
} from "@phosphor-icons/react";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLightMode = !mounted ? true : resolvedTheme !== "dark";
  const lampRef = useRef<HTMLButtonElement>(null);
  const cablePathRef = useRef<SVGPathElement>(null);
  const [showLogos, setShowLogos] = useState(false);
  const [showOutside, setShowOutside] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Console Easter Egg
    console.log(
      `%c
  ____  __  __ _  __    _      _    ____  
 / __ \\|  \\/  | |/ /   / \\    / \\  |  _ \\ 
| |  | | |\\/| | ' /   / _ \\  / _ \\ | |_) |
| |__| | |  | | . \\  / ___ \\/ ___ \\|  _ < 
 \\____/|_|  |_|_|\\_\\_/   \\_\\_/   \\_\\_| \\_\\
                                   
%c DATA ENGINEER // PHILADELPHIA %c
Reach out if you are interested in the code for this website!

%c---------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------:--
-----------------------------------------------------------------------------------------::----:---------::::::
---------------------------------------------------------------:--:------:---::-:::::-::::::-::::::::::::::::::
------------------------------:-::--::---:::----:**#----:--::::::::::::::::::::::::::::::::::::::::::::::::::::
--------------------------:--::::-::::::::::::---+#*---::::::::::::::::::::::::::::::::::::::::::::::::::::::::
-------------:-:::-:::::::::::::::::::::::::::--+####=--:::::::::::::::::::::::::::::::::::::::::::::::::::::::
::---::::::::::::::::::::::::::::::::::::::-=+#########%#+--:::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::-#%%##+*#**#**##%#%=::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::+#+=-:----++=+++**+:::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::::---------+==++++*-:::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::::------=--+=+++***-:::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::::----:----===+++++-:::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::::-=-+--=+=+++*++**=:::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::-=====-=+==+++*+***+==:::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::+==++++#%%%%@@@*%#*+*=:::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::+#%%#+*+=+=+**#+##%%%#:::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::=#%##---=---=++==++*+*=:::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::=%#%---===-====+++*++=:::::::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::::--=%%%---=++=====++++++=-=-::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::=---#%%-===*+=++++++**++=-=+-:::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::+==*%##*##%%@@@@@@@%%%%%####-:::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::=##%%@@@@%@%%##%##%@%@@@@%@@%#=::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::-%%@@%@@%==#*+=+*++*%%@@#%@@@%%-::::::::::::::::::::::::::::::::::::::::::::
::::::::::::::::::::::::::::::::::::+%%%#%%%--**--=*+=+%%%%*##%%+=::::::::::::::.::::::::.:::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::+=**%%%--=+--=+==+#%%%*##+:=:::::::.................::....:.........:.:...
::::::::::::::::::::::::::::::::..:::::-*%%%%%%%@@@@@@@@@@@%#%=:.....................................::........
:::::::::::::::::::::::.:.........:.:::=%%%%##+++++++++***%%%%#-...............................................
::::::::::::....:.:...................:**::::---=+++=+=====++++:...............................................
:::::::::..:...........................---::::-------====+=+*+-................................................
:::::..::..............................:::::::::-------====+==-................................................
.......................................::::::::::------======+-................................................
.......................................::::::::::------======+=................................................
.......................................:::::::::-------======+=:...............................................
.......................................::::::::::-------=====+=:...............................................
.......................................::::::::::-------=======:...............................................
.......................................::::::::::-------=======:...............................................
.......................................::::::::::-------=======:...............................................
.......................................::::::::::-------======+:...............................................
.......................................::::::::::-------=======-...............................................
.......................................::::::::::-------=======-...............................................
.......................................::::::::::-------=======-...............................................
.......................................::::::::::-------========...............................................
.......................................::::::::::--------=======...............................................
.......................................::::::::::--------=======...............................................
.......................................::::::::::--------======+...............................................
.......................................::::::::::-------========:..............................................
.......................................::::::::::--------=======:..............................................
.......................................::::::::::--------=======-..............................................
......................................:::::::::::--------=======-..............................................
......................................:::::::::::--------========..............................................
......................................:::::::::::--------===+**+=..............................................
......................................:::::::::::--------=#%*+===............................................::
......................................:::::::::::---------%%*-===:.....................................::::::::
......................................::::::::::----------#%*-===:...........................::::::::::::::::::
......................................:::::::::-----------%%*-===:.........:::::..:::::::::::::::::::::::::::::
......................................::::::::::----------#%+-===-..........:::::::::::::::::::::::::::::::::::
......................................:::::::::----------=*%*-===-......:::::::::::::::::::::----:::::-:-------
......................................::::::::-----------=+%+====-..:::::::::::::------------------------------
.....................................:::::::::-----------=+**+++==:::::::::::::::::----------------------------
.....................................:::::::-------------=====+===::::::::::::::-------------------------------
.....................................:::::::-------------=========:::::::::::::--------------------------------
.....................................:::::::------------==========::::::::::::---------------------------------
.....................................::::::-:------------=========:.:::::::::----------------------------------
.....................................::::::::------------=========:::::::::------------------------------------
.....................................::::::::------------=========-----------------------------------------::--
.....................................:::::::-------------=++**++==-::-------------------------------------:::--
.....................................:::::::------------=*##@%*==+-:::::::::::---------++*#*-------------------
.....................................:::::::-------------++*##+====:::::::::::::::::::=#*#%*-----::-------::::-
.....................................::::::::------------++*##+=+==.............:.::::-*+*#+:::::::::::::::::::
.....................................::::::::----------++*+*##+====....................*+*#+.....::::::::::::--
.....................................::::::::--------==**%%####%%#%#########****++++==+*****:..............::::
....................................:::::::::-------==+*+=#%%%##%%%#####################%######-...............
....................................::::::::-------=+++=-=+=###%%%%#%%%%%%###############*%%%#%##=.............
....................................:::::::------==+++----+--=##%%%%%%%%%%%%%%########%%%%**#%%%###-...........
....................................:::::::-----==++=--:::-::--+#%%%%%%%%%%%%%######%%%%%@%%#*#%%%#%#=.........
....................................:::::::----=*%%+--::::::::--**#%%#%%###%#%%%%##@@%#*%*@@%#%##%%####+.......
....................................:::::::---=**##=::-=:::-=*+=-*+*******#****+**%@@%*+##%########*=+++=......
....................................:::::::-------===*%=*=:=%#+*:===+=+++++++===+*@%%%++#****+*++**=...........
....................................:::::::---------=*%=*=:=%%+*::-=+==========-*+%%%%+=#+++++======...........
...................................::::::::--------:=*%=*=:=%%+*::-+==========--*=%%%%+=#++========-...........
::::::::::::::::::::::::::::::--:-=+++++*#*******#+:=*%=*=:=#%++::-====*##+===--==%%%%==+====++====-:::::::::::
:::::::::::::::::::::::--:::::---=********###%%%%%*:=*%**-:-**+=---====***+=======####+======*+====-:::::::::::
:::::::::=-==-:::::::::-::::::-+*+-------==-=+-=+==-=-------------==+=========+-==+*%#+=+===========::::::-:--:
::::::::-=-====+=------=-:::-+**+=-=----==++++-==-=-=-------------===========+*###++##**+++++*++++=++--::-:----
:::-:-==-======++====--======+*=*=+#====++=+++=+===-+=+*---==*=-======+*++**+++**#########%###****#**##*#******
=-=+===+++++++=++++*++=++******+*####%#***+****+******#####***###########*##%%%#####%#####*##***##**##*#%%%%**#
**#######***###%**###*********+**##*#*############%######%##*###*####%%%%%%#**#*#%#*##**#%******#*##########*#
      `,
      "color: #111111; font-weight: bold; font-family: monospace;",
      "background: #111111; color: #FFFFFF; padding: 2px 5px; font-weight: bold; font-family: monospace;",
      "color: #888888; font-style: italic; font-family: monospace;",
      "font-size: 8px; line-height: 0.8; letter-spacing: -0.5px; color: #FFFFFF; background: #000000; font-family: monospace;"
    );

    gsap.fromTo(
      ".hero-line",
      { opacity: 0, y: 40, skewY: 1.5 },
      { opacity: 1, y: 0, skewY: 0, duration: 0.85, ease: "power3.out", stagger: 0.12, delay: 0.2 }
    );
    gsap.fromTo(
      ".hero-underline",
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.7, ease: "power2.out", delay: 0.75 }
    );

    // ── ELASTIC LAMP DRAGGING ──
    if (lampRef.current && cablePathRef.current) {
      const anchorX = 108;
      const anchorY = 32;

      Draggable.create(lampRef.current, {
        type: "x,y",
        onDrag: function () {
          const rawX = this.x;
          const rawY = this.y;
          const dist = Math.sqrt(rawX * rawX + rawY * rawY);
          const tension = 1 / (1 + dist * 0.003);
          const actualX = rawX * tension;
          const actualY = rawY * tension;
          gsap.set(this.target, { x: actualX, y: actualY });

          const lampBaseX = 37 + actualX;
          const lampBaseY = 65 + actualY;
          const cp1x = lampBaseX + 15;
          const cp1y = lampBaseY + 30;
          const cp2x = anchorX - 5;
          const cp2y = anchorY + 35;
          cablePathRef.current?.setAttribute("d", `M ${lampBaseX} ${lampBaseY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${anchorX} ${anchorY}`);
        },
        onDragEnd: function () {
          gsap.to(this.target, {
            x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)", onUpdate: () => {
              const x = gsap.getProperty(this.target, "x") as number;
              const y = gsap.getProperty(this.target, "y") as number;
              const lampBaseX = 37 + x;
              const lampBaseY = 65 + y;
              const cp1x = lampBaseX + 15;
              const cp1y = lampBaseY + 30;
              const cp2x = anchorX - 5;
              const cp2y = anchorY + 35;
              cablePathRef.current?.setAttribute("d", `M ${lampBaseX} ${lampBaseY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${anchorX} ${anchorY}`);
            }
          });
        }
      });
    }
  }, []);

  return (
    <>
      <main style={{
        position: "fixed", inset: 0, width: "100vw", height: "100vh", overflow: "hidden",
        backgroundColor: "transparent",
        transition: "background-color 0.4s ease, filter 1.2s ease-in-out",
        filter: showOutside ? "sepia(0.15) saturate(1.2) contrast(0.95)" : "none",
        zIndex: 20,
        pointerEvents: "none"
      }}>
        <h1 className="sr-only">Omkaar Shenoy - Data Engineer based in Philadelphia</h1>

        <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id="sticker-outline" x="-20%" y="-20%" width="140%" height="140%">
              <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dilatedAlpha" />
              <feFlood floodColor="white" result="whiteColor" />
              <feComposite in="whiteColor" in2="dilatedAlpha" operator="in" result="outline" />
              <feDropShadow in="outline" dx="4" dy="6" stdDeviation="4" floodColor="rgba(0,0,0,0.4)" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="outline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        <header style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: "clamp(3rem, 8vw, 9rem)", zIndex: 20, pointerEvents: "none", userSelect: "none", mixBlendMode: "normal" }}>
          <div>
            <h1 className="hero-line luxury-text" style={{ opacity: 0, margin: 0, display: "block", fontSize: "clamp(3.8rem, 4vw, 8.5rem)", position: "relative", transition: "opacity 0.4s ease" }}>
              Omkaar Shenoy.
              <span className="hero-underline" style={{ position: "absolute", bottom: "0.06em", left: 0, width: "60%", height: "1px", background: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", display: "block", transformOrigin: "left center", transition: "background 0.4s ease" }} />
            </h1>

            <div style={{ position: "relative" }}>
              <div style={{
                opacity: showOutside ? 0 : 1,
                transform: showOutside ? "translateY(-10px)" : "translateY(0)",
                transition: showOutside ? "none" : "opacity 0.8s ease, transform 0.8s ease",
                pointerEvents: showOutside ? "none" : "auto",
              }}>
                <div className="hero-line luxury-subtext" style={{ opacity: 0, marginTop: "2rem", fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  I&apos;m a Data Engineer at Aramark, with previous experience at WebstaurantStore, NPR, and others.
                </div>

                <div className="hero-line luxury-subtext" style={{ opacity: 0, marginTop: "1rem", fontSize: "clamp(0.8rem, 1.2vw, 0.95rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  My daily work involves building core data infrastructure for millions of records moving at a global scale.
                </div>

                <div className="hero-line luxury-subtext" style={{ opacity: 0, marginTop: "1rem", fontSize: "clamp(0.75rem, 1.1vw, 0.85rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  Please reach out below for any interesting opportunities &mdash; I&apos;m always happy to talk.
                </div>
              </div>

              <div style={{
                opacity: showOutside ? 1 : 0,
                transform: showOutside ? "translateY(0)" : "translateY(10px)",
                transition: showOutside ? "opacity 0.8s ease, transform 0.8s ease" : "none",
                pointerEvents: showOutside ? "auto" : "none",
                position: "absolute",
                top: 0,
                left: 0,
              }}>
                <div className="luxury-subtext" style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  I spend most of my time outside engineering experimenting new dishes in the kitchen, building weird side projects, and getting involved in random side quests around the city.
                </div>

                <div className="luxury-subtext" style={{ marginTop: "1rem", fontSize: "clamp(0.8rem, 1.2vw, 0.95rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  Most of the stuff here started as a random idea that sounded interesting enough to start obsessing over.
                </div>

                <div className="luxury-subtext" style={{ marginTop: "1rem", fontSize: "clamp(0.75rem, 1.1vw, 0.85rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  Every background photo on this site was taken by me somewhere along the way.
                </div>
              </div>
            </div>

            <div className="hero-line" style={{ opacity: 0, marginTop: "2.2rem", display: "flex", gap: "1rem", pointerEvents: "auto", alignItems: "center" }}>
              <a href="/Omkaar_Shenoy_Resume.pdf" target="_blank"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)", fontSize: "0.78rem", fontWeight: 500, fontFamily: "var(--font-luxury)", textDecoration: "none", letterSpacing: "0.01em", borderBottom: `1px solid ${isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"}`, paddingBottom: "1px", transition: "color 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "#111111" : "#FFFFFF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"; }}
              >
                <ArrowUpRight size={13} /> resume
              </a>
              <span style={{ color: isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.7)", fontSize: "0.7rem", transition: "color 0.4s ease" }}>/</span>
              <button
                type="button"
                onClick={() => {
                  setShowLogos(prev => !prev);
                  if (!showLogos) setShowOutside(false);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", color: isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)", fontSize: "0.78rem", fontWeight: 500, fontFamily: "var(--font-luxury)", textDecoration: "none", letterSpacing: "0.01em", borderBottom: `1px solid ${isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"}`, paddingBottom: "1px", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", transition: "color 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "#111111" : "#FFFFFF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,0.7)" : "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"; }}
              >
                <SuitcaseSimple size={13} />experiences + skills

                <CaretDown
                  size={12}
                  weight="bold"
                  style={{
                    transform: showLogos ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    opacity: 0.8,
                    marginLeft: "0.1rem"
                  }}
                />
              </button>
              <span style={{ color: isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.7)", fontSize: "0.7rem", transition: "color 0.4s ease" }}>/</span>
              <button
                type="button"
                onClick={() => {
                  setShowOutside(prev => !prev);
                  if (!showOutside) setShowLogos(false);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", fontSize: "0.78rem", fontWeight: 500, fontFamily: "var(--font-luxury)", textDecoration: "none", letterSpacing: "0.01em", borderBottom: `1px solid ${isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"}`, paddingBottom: "1px", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", transition: "color 0.2s, border-color 0.2s", paddingLeft: '0px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "#111111" : "#FFFFFF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,0.7)" : "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"; }}
              >
                <GameController size={13} /> outside of work
                <CaretDown
                  size={12}
                  weight="bold"
                  style={{
                    transform: showOutside ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    opacity: 0.8,
                    marginLeft: "0.1rem"
                  }}
                />
              </button>
            </div>
          </div>
        </header>

        <LogoScrap src="/images/experiences/aramark-logo.png" alt="Aramark"
          initialPos={{ x: "60%", y: "20%", rotate: -4 }} size={220} tooltipDir="right"
          tooltip={{ category: "Job", title: "Aramark", sub: "Building Core Data Infra", period: "May 2025 – Present · Philadelphia", tags: ["Snowflake", "dbt", "Azure", "Snowpipe"], stat: "20M+", statLabel: "events/mo" }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/npr-logo.png" alt="NPR"
          initialPos={{ x: "82%", y: "22%", rotate: 5 }} size={200} tooltipDir="left"
          tooltip={{ category: "Job", title: "NPR", sub: "Scaling NPR.org", period: "Jun – Aug 2022 · Washington DC", tags: ["PHP", "HTML5", "Docker", "Kubernetes"], stat: "npr.org", statLabel: "shipped" }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/webstaurantstore-logo.png" alt="WebstaurantStore"
          initialPos={{ x: "58%", y: "45%", rotate: -6 }} size={220} tooltipDir="right"
          tooltip={{ category: "Job", title: "WebstaurantStore", sub: "Automating the test pipeline", period: "May 2024 – May 2025 · Remote", tags: ["Java", "Selenium", "Azure DevOps", "SQL Server"], stat: "-50%", statLabel: "QA cycles" }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/asu-logo.png" alt="Arizona State University"
          initialPos={{ x: "75%", y: "58%", rotate: 7 }} size={200} tooltipDir="left"
          tooltip={{ category: "Education", title: "Arizona State University", sub: "B.S. Computer Science", period: "Graduated May 2025 · Tempe, AZ", tags: ["CS", "Media Arts Minor", "DAAD Scholar"], stat: "4.00", statLabel: "GPA" }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/sunhacks-logo.png" alt="sunhacks"
          initialPos={{ x: "56%", y: "75%", rotate: -5 }} size={200} tooltipDir="right"
          tooltip={{ category: "Leadership", title: "sunhacks", sub: "Running ASU&apos;s biggest hackathon", period: "Tempe, AZ", tags: ["600 Attendees", "2× YoY Growth", "$40K Budget"], stat: "600", statLabel: "attendees" }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/snowflake-logo.png" alt="Snowflake"
          initialPos={{ x: "46%", y: "38%", rotate: -8 }} size={85} tooltipDir="right"
          tooltip={{ category: "Skill", title: "Snowflake", sub: "Managing 2K+ locations", period: "Aramark — current stack", tags: ["Streams", "Snowpipe", "Star Schema"] }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/dbt-logo.png" alt="dbt"
          initialPos={{ x: "85%", y: "35%", rotate: 4 }} size={85} tooltipDir="left"
          tooltip={{ category: "Skill", title: "dbt", sub: "Migrated raw SQL → dbt", period: "Aramark", tags: ["Models", "Tests", "Docs", "Maintainability"] }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/azure-logo.png" alt="Microsoft Azure"
          initialPos={{ x: "70%", y: "14%", rotate: -5 }} size={85} tooltipDir="left"
          tooltip={{ category: "Skill", title: "Microsoft Azure", sub: "Cloud & Ingestion pipelines", period: "Aramark + WebstaurantStore", tags: ["Event Grid", "Functions", "DevOps", "Queues"] }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/java-logo.png" alt="Java"
          initialPos={{ x: "48%", y: "55%", rotate: 9 }} size={80} tooltipDir="right"
          tooltip={{ category: "Skill", title: "Java", sub: "Test Automation at scale", period: "WebstaurantStore", tags: ["Selenium Grid", "JUnit", "Parallel Execution"], stat: "-50%", statLabel: "regression time" }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/python-logo.png" alt="Python"
          initialPos={{ x: "78%", y: "42%", rotate: 6 }} size={80} tooltipDir="left"
          tooltip={{ category: "Skill", title: "Python", sub: "Scripting & Pipelines", period: "Aramark + HackKit", tags: ["pandas", "SQLAlchemy", "automation"] }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/docker-logo.png" alt="Docker"
          initialPos={{ x: "48%", y: "85%", rotate: -3 }} size={85} tooltipDir="right"
          tooltip={{ category: "Skill", title: "Docker", sub: "Containerizing everything", period: "NPR · WebstaurantStore · HackKit", tags: ["Compose", "Kubernetes", "CI/CD pipelines"] }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/mongodb-logo.png" alt="MongoDB"
          initialPos={{ x: "90%", y: "65%", rotate: 5 }} size={80} tooltipDir="left"
          tooltip={{ category: "Skill", title: "MongoDB", sub: "Real-time scoring for 5K+ users", period: "Open Source — HackKit", tags: ["Schemas", "Aggregation", "HackKit"], stat: "5K+", statLabel: "participants" }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/kubernetes-logo.png" alt="Kubernetes"
          initialPos={{ x: "75%", y: "85%", rotate: 6 }} size={80} tooltipDir="left"
          tooltip={{ category: "Skill", title: "Kubernetes", sub: "Production Orchestration", period: "NPR — Docker/K8s pipelines", tags: ["Deployments", "Staged Rollout", "Production"] }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/postgresql-logo.png" alt="PostgreSQL"
          initialPos={{ x: "88%", y: "84%", rotate: -7 }} size={80} tooltipDir="left"
          tooltip={{ category: "Skill", title: "PostgreSQL", sub: "Relational Modeling", period: "HackKit + general use", tags: ["SQL", "Data Modeling", "Analytics"] }}
          isVisible={showLogos}
        />

        <LogoScrap src="/images/experiences/eagleeyes.png" alt="EagleEyes Search"
          initialPos={{ x: "80%", y: "38%", rotate: -3 }} size={160} tooltipDir="left"
          tooltip={{ category: "Job", title: "EagleEyes Search", sub: "Drone Control Interface", period: "Search & Rescue Startup", tags: ["Web App", "UI", "Drones"] }}
          isVisible={showLogos}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/justateit.png"
          alt="justateit"
          href="https://justateit.com/"
          tooltip={{
            category: "Project",
            title: "justateit",
            sub: "tracking specific dishes instead of whole restaurants",
            period: "In Development",
            tags: ["Taste Mapping", "iOS App"],
            stat: "WIP",
            statLabel: "launching soon"
          }}
          tooltipDir="left"
          initialPos={{ x: "65%", y: "17%", rotate: -4 }}
          size={200}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/kulfiboba.png"
          alt="kulfiboba"
          href="https://kulfiboba.vercel.app/"
          tooltip={{
            category: "Project",
            title: "kulfiboba",
            sub: "recipes without the life stories",
            period: "Active Archive",
            tags: ["Personal", "No-BS Food"],
            stat: "100%",
            statLabel: "signal, no noise"
          }}
          tooltipDir="right"
          initialPos={{ x: "56%", y: "40%", rotate: 4 }}
          size={180}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/boxdbuddy.png"
          alt="boxdbuddy"
          tooltip={{
            category: "Project",
            title: "boxdbuddy",
            sub: "fixing letterboxd's missing features",
            period: "Chrome Extension",
            tags: ["UI Tweaks", "Filtering"]
          }}
          tooltipDir="left"
          initialPos={{ x: "86%", y: "25%", rotate: 5 }}
          size={100}
          isVisible={showOutside}
        />
        
        <PersonalScrap
          type="cutout"
          src="/images/outside-work/wikigraph.png"
          alt="wikigraph"
          tooltip={{
            category: "Project",
            title: "wikigraph",
            sub: "mapping wikipedia rabbit holes",
            period: "Session Tracker",
            tags: ["Data Viz", "Nodes"],
            stat: "∞",
            statLabel: "depth"
          }}
          tooltipDir="right"
          initialPos={{ x: "64%", y: "60%", rotate: -6 }}
          size={100}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/portfolio-stack.png"
          alt="portfolio versions"
          tooltip={{
            category: "Project",
            title: "this portfolio",
            sub: "third iteration, i spend a lot of time trying new designs",
            period: "2026 Build",
            tags: ["Next.js", "GSAP", "ASCII"],
            stat: "v3",
            statLabel: "you can find the first two on github"
          }}
          tooltipDir="right"
          initialPos={{ x: "52%", y: "22%", rotate: 2 }}
          size={180}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="polaroid"
          src="/images/outside-work/cooking.png"
          alt="cooking"
          tooltip={{
            category: "Hobby",
            title: "Cooking",
            sub: "feeding friends and winding down",
            tags: ["Experimentation", "Dinner Parties"]
          }}
          tooltipDir="left"
          initialPos={{ x: "68%", y: "42%", rotate: -4 }}
          size={160}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/ektar.png"
          alt="first few rolls"
          tooltip={{
            category: "Hobby",
            title: "Analog Photography",
            sub: "expensive hobby I just picked up",
            tags: ["Kodak Ektar", "Point & Shoot"],
            stat: "3",
            statLabel: "rolls deep"
          }}
          tooltipDir="right"
          initialPos={{ x: "53%", y: "62%", rotate: 4 }}
          size={170}
          isVisible={showOutside}
        />
        
        {/* <PersonalScrap
          type="cutout"
          src="/images/outside-work/movies.png"
          alt="movies"
          tooltip={{
            category: "Interest",
            title: "Movie nerd",
            sub: "sci-fi and incredibly slow pacing",
            tags: ["Letterboxd", "A24", "Sci-Fi"]
          }}
          tooltipDir="left"
          initialPos={{ x: "84%", y: "75%", rotate: 3 }}
          size={160}
          isVisible={showOutside}
        /> */}

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/backpacking.png"
          alt="budget backpacking"
          tooltip={{
            category: "Travel",
            title: "Backpacking",
            sub: "almost got stranded in iceland",
            period: "Budget Travel",
            tags: ["Hostels", "Guatemala"],
            stat: "1",
            statLabel: "near stranding"
          }}
          tooltipDir="left"
          initialPos={{ x: "76%", y: "56%", rotate: -5 }}
          size={170}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/gazella.png"
          alt="gazella"
          tooltip={{
            category: "Volunteer",
            title: "Phila Ship Guide",
            sub: "building a literal ship",
            period: "Gazella",
            tags: ["Sanding", "Masts", "Sailing"],
            stat: "50",
            statLabel: "hours sanded"
          }}
          tooltipDir="left"
          initialPos={{ x: "78%", y: "20%", rotate: 6 }}
          size={180}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/zoo.png"
          alt="philadelphia zoo"
          tooltip={{
            category: "Volunteer",
            title: "Philadelphia Zoo",
            sub: "cleaning and guiding tours",
            period: "Docent",
            tags: ["Conservation", "Education"],
            stat: "New",
            statLabel: "role"
          }}
          tooltipDir="right"
          initialPos={{ x: "58%", y: "82%", rotate: -2 }}
          size={160}
          isVisible={showOutside}
        />

        <PersonalScrap
          type="cutout"
          src="/images/outside-work/paws.png"
          alt="paws shelter"
          tooltip={{
            category: "Volunteer",
            title: "PAWS",
            sub: "walking and cleaning",
            period: "Shelter Volunteer",
            tags: ["Dogs", "Cats"]
          }}
          tooltipDir="right"
          initialPos={{ x: "71%", y: "80%", rotate: 4 }}
          size={160}
          isVisible={showOutside}
        />

        <nav className="animate-on-load" style={{ position: "fixed", top: "2rem", right: "2rem", zIndex: 1000, display: "flex", flexDirection: "row", gap: "1.5rem", pointerEvents: "auto" }} aria-label="Theme toggle">
          <svg style={{ position: "absolute", top: "0", left: "0", width: "150px", height: "150px", overflow: "visible", pointerEvents: "none", zIndex: 0 }}>
            <rect x="106" y="24" width="8" height="16" rx="1" fill={isLightMode ? "rgba(17,17,17,0.15)" : "rgba(255,255,255,0.1)"} />
            <path ref={cablePathRef} d="M 37 65 C 52 95, 103 67, 108 32" stroke={isLightMode ? "rgba(17,17,17,0.7)" : "rgba(255,255,255,0.4)"} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="106" y="28" width="6" height="8" rx="1" fill={isLightMode ? "rgba(17,17,17,0.8)" : "rgba(255,255,255,0.5)"} />
          </svg>

          <button
            ref={lampRef}
            title="Toggle Light Mode"
            onClick={() => setTheme(isLightMode ? "dark" : "light")}
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "block", position: "relative", zIndex: 1 }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {!isLightMode && (
              <div style={{ position: "absolute", top: "50%", left: "-90%", width: "180px", height: "280px", background: "linear-gradient(190deg, rgba(255,250,210,0.25) 0%, transparent 75%)", clipPath: "polygon(50% -32px, 0% 100%, 100% 100%)", transformOrigin: "top center", transform: "rotate(30deg)", pointerEvents: "none", zIndex: -1, filter: "blur(12px)", transition: "opacity 0.4s ease" }} />
            )}
            <img src="/images/lamp.png" alt="Light Mode" style={{ position: "relative", zIndex: 1, width: "75px", height: "75px", objectFit: "contain", filter: isLightMode ? `drop-shadow(2px 4px 6px rgba(0,0,0,0.3)) ${showOutside ? 'sepia(0.3) saturate(1.2)' : ''}` : `drop-shadow(0 0 10px rgba(255,250,210,${showOutside ? '0.6' : '0.3'}))`, transition: "filter 1.2s ease-in-out" }} />
          </button>
        </nav>

        <nav className="animate-on-load" style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 1000, display: "flex", gap: "1rem", alignItems: "center", pointerEvents: "auto" }} aria-label="Social links">
          <a href="mailto:omkaarshenoyos@gmail.com" style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
          >
            <Envelope size={15} weight="fill" />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>get in touch</span>
          </a>
          <a href="https://github.com/omkaarshenoy" target="_blank" style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
          >
            <GithubLogo size={15} weight="fill" />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>github</span>
          </a>
          <a href="https://linkedin.com/in/omkaarshenoy" target="_blank" style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
          >
            <LinkedinLogo size={15} weight="fill" />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>linkedin</span>
          </a>
        </nav>
      </main>
    </>
  );
}
