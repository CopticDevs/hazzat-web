import { useContext, useEffect } from "react";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import BreadCrumb from "./BreadCrumb";
import HelpTip from "./HelpTip";
import HymnTitle from "./HymnTitle";
import MyNavLink from "./MyNavLink";

function UsingHazzatFont() {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";
    const padLangClassName = languageProperties.isRtl ? "padRight" : "padLeft";

    useEffect(() => {
        document.title = strings.usingTheHazzatFont + " - hazzat.com";
    }, []);

    return (
        <>
            <div className="pageTitle"><LocalizedMessage of="usingTheHazzatFont" /></div>
            <BreadCrumb items={[
                { title: strings.help, path: "/Help" },
                { title: strings.usingTheHazzatFont }]} />

            <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                <HymnTitle content={strings.topics} />
            </div>
            <div className="clear" />
            <p style={{ paddingBottom: "33px" }}>
                <a href="#aboutHelp"><LocalizedMessage of="aboutHelp" /></a><br />
                <a href="#aboutHazzat"><LocalizedMessage of="aboutHazzat" /></a><br />
                <a href="#keymappings"><LocalizedMessage of="keyMappings" /></a><br />
                <a href="#usage"><LocalizedMessage of="usage" /></a><br />
                <div className={padLangClassName}>
                    <a href="#regularNotes"><LocalizedMessage of="regularNotes" /></a><br />
                    <a href="#shortNotes"><LocalizedMessage of="shortNotes" /></a><br />
                    <a href="#highNotes"><LocalizedMessage of="highNotes" /></a><br />
                    <a href="#regularExtend"><LocalizedMessage of="regularExtend" /></a><br />
                    <a href="#vibratedNotes"><LocalizedMessage of="vibratedNotes" /></a><br />
                    <a href="#specialChars"><LocalizedMessage of="specialChars" /></a><br />
                    <div className={padLangClassName}>
                        <a href="#abrupt"><LocalizedMessage of="abrupt" /></a><br />
                        <a href="#fastChant"><LocalizedMessage of="fastChant" /></a><br />
                        <a href="#breathMark"><LocalizedMessage of="breathMark" /></a><br />
                        <a href="#lowerOrHigher"><LocalizedMessage of="lowerOrHigher" /></a><br />
                        <a href="#repeatMark"><LocalizedMessage of="repeatMark" /></a><br />
                        <a href="#markingChars"><LocalizedMessage of="markingChars" /></a><br />
                    </div>
                </div>
                <a href="#exampleHymn"><LocalizedMessage of="exampleHymn" /></a><br />
                <a href="#helpfulTip"><LocalizedMessage of="helpfulTip" /></a><br />
            </p>




            <section id="aboutHelp">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.aboutHelp} />
                </div>
                <div className="clear" />
                <p><LocalizedMessage of="aboutHelpContent" /></p>
            </section>

            <section id="aboutHazzat">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.aboutHazzat} />
                </div>
                <div className="clear" />
                <p dangerouslySetInnerHTML={{ __html: strings.hazzatFontReason }} />
                <p dangerouslySetInnerHTML={{ __html: strings.hazzatAdvantagesList }} />
                <p dangerouslySetInnerHTML={{ __html: strings.hazzatDescSummary }} />
            </section>

            <section id="keymappings">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.keyMappings} />
                </div>
                <div className="clear" />
                <div className="container">
                    <div className="row">
                        <div className="col-sm-1 border"><LocalizedMessage of="key" /></div>
                        <div className="col-sm-1 border"><LocalizedMessage of="symbol" /></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="description" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>z</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>z</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="oneNote" /><br /><LocalizedMessage of="firstExtender" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>x</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>x</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="twoNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>c</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>c</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="threeNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>v</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>v</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fourNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>b</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>b</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fiveNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>n</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>n</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="sixNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>m</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>m</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="sevenNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>q</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>q</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="oneShortNote" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>w</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>w</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="twoShortNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>e</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>e</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="threeShortNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>r</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>r</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fourShortNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>t</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>t</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fiveShortNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>y</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>y</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="sixShortNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>u</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>u</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="sevenShortNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>s</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>s</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="secondExtender" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>d</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>d</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="thirdExtender" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>f</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>f</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fourthExtender" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>g</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>g</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fifthExtender" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>h</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>h</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="sixthExtender" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>Z</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>Z</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="oneHighNote" /><br /><LocalizedMessage of="seventhExtender" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>X</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>X</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="twoHighNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>C</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>C</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="threeHighNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>V</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>V</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fourHighNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>B</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>B</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fiveHighNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>N</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>N</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="sixHighNotes" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>A</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&nbsp;A</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="secondVibrated" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>S</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&nbsp;S</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="thirdVibrated" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>D</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&nbsp;D</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fourthVibrated" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>F</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&nbsp;F</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fifthVibrated" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>G</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&nbsp;G</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="sixthVibrated" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>a</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>a</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="abruptNote" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>j</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&nbsp;J</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fastUnderscore" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>J</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&nbsp;J</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="fastArrow" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>.</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>.</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="pauseMark" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>+</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>+</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="higherTone" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>-</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>-</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="lowerTone" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>1</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>1</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatOne" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>2</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>2</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatTwo" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>3</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>3</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatThree" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>4</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>4</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatFour" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>5</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>5</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatFive" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>6</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>6</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatSix" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>7</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>7</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatSeven" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>8</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>8</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatEight" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>9</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>9</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="repeatNine" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>0</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>0</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="zeroNote" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>!</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>!</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="markOne" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>@</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>@</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="markTwo" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>#</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>#</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="markThree" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>$</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>$</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="markFour" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>%</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>%</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="markFive" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>^</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>^</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="markSix" /></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1 border"><span style={{ fontSize: "29pt" }}>&</span></div>
                        <div className="col-sm-1 border dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>&</span></div>
                        <div className="col-sm-6 border"><LocalizedMessage of="markSeven" /></div>
                    </div>
                </div>
            </section>

            <section id="usage">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.usage} />
                </div>
                <div className="clear" />
            </section>

            <section id="regularNotes">
                <p><u><LocalizedMessage of="regularNotes" /></u></p>
                <p><LocalizedMessage of="regularDesc1" /></p>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>z</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>z</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="oneNote" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>x</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>x</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="twoNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>c</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>c</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="threeNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>v</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>v</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="fourNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>b</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>b</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="fiveNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>n</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>n</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="sixNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>m</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>m</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="sevenNotes" />)</span></div>
                    </div>
                </div>
                <HelpTip content={strings.regularTip} />
                <p><LocalizedMessage of="regularDesc2" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>ccc</span>&nbsp; &nbsp;(<LocalizedMessage of="threeLongNotes" />)</p>
                <p><LocalizedMessage of="regularDesc3" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xc</span>&nbsp; &nbsp;(<LocalizedMessage of="twoLongOneReg" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>zv</span>&nbsp; &nbsp;(<LocalizedMessage of="oneLongThreeReg" />)</p>
                <p>&nbsp;</p>
            </section>

            <section id="shortNotes">
                <p><u><LocalizedMessage of="shortNotes" /></u></p>
                <p><LocalizedMessage of="regularDesc1" /></p>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>q</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>q</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="oneShortNote" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>w</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>w</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="twoShortNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>e</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>e</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="threeShortNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>r</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>r</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="fourShortNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>t</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>t</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="fiveShortNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>y</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>y</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="sixShortNotes" />)</span></div>
                    </div>
                    <div className="row">
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}>u</span></div>
                        <div className="col-sm-1"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></div>
                        <div className="col-sm-1 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>u</span></div>
                        <div className="col-sm-6"><span>(<LocalizedMessage of="sevenShortNotes" />)</span></div>
                    </div>
                </div>
                <HelpTip content={strings.shortTip} />
            </section>

            <section id="highNotes">
                <p><u><LocalizedMessage of="highNotes" /></u></p>
            </section>

            <section id="regularExtend">
                <p><u><LocalizedMessage of="regularExtend" /></u></p>
            </section>

            <section id="vibratedNotes">
                <p><u><LocalizedMessage of="vibratedNotes" /></u></p>
            </section>

            <section id="specialChars">
                <p><u><LocalizedMessage of="specialChars" /></u></p>
            </section>

            <section id="abrupt">
                <p><u><LocalizedMessage of="abrupt" /></u></p>
            </section>

            <section id="fastChant">
                <p><u><LocalizedMessage of="fastChant" /></u></p>
            </section>

            <section id="breathMark">
                <p><u><LocalizedMessage of="breathMark" /></u></p>
            </section>

            <section id="lowerOrHigher">
                <p><u><LocalizedMessage of="lowerOrHigher" /></u></p>
            </section>

            <section id="repeatMark">
                <p><u><LocalizedMessage of="repeatMark" /></u></p>
            </section>

            <section id="markingChars">
                <p><u><LocalizedMessage of="markingChars" /></u></p>
            </section>

            <section id="exampleHymn">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.exampleHymn} />
                </div>
                <div className="clear" />
                <div className="dirLtr border p-3">
                    <span className="CopticFont">`K`cmarwout aly;wc@ nem Pekiwt `n`aga;oc@ nem Pi`pneuma `e;ouab@ je ak`i akcw] `mmon.</span> <br />
                    <br />
                    <span className="CopticFont">`</span><span className="HazzatFont">z</span><span className="CopticFont">K`</span><span className="HazzatFont">xx</span><span className="CopticFont"> cma</span><span className="HazzatFont">zAzA.xx zz</span><span className="CopticFont"> rw</span><span className="HazzatFont">j</span><span className="CopticFont">o</span><span className="HazzatFont">jJ</span><span className="CopticFont">u</span><span className="HazzatFont"> zz.x</span><span className="CopticFont"> t a</span><span className="HazzatFont">zz.cd.x</span><span className="CopticFont"> ly</span><span className="HazzatFont">zz x.x x </span><span className="CopticFont">;w</span><span className="HazzatFont">zz x.+zc </span><span className="CopticFont">c@ ne</span><span className="HazzatFont">zz x</span><span className="CopticFont"> m Pe</span><span className="HazzatFont">x x</span><span className="CopticFont"> kiw</span><span className="HazzatFont">+zz.x</span><span className="CopticFont"> t `</span><span className="HazzatFont">xx</span><span className="CopticFont"> n`a</span><span className="HazzatFont">zz.cd.+x</span><span className="CopticFont"> ga</span><span className="HazzatFont">zz x x x </span><span className="CopticFont">;o</span><span className="HazzatFont">zz x.+zc </span><span className="CopticFont"> c@ ne</span><span className="HazzatFont">zz x</span><span className="CopticFont"> m Pi</span><span className="HazzatFont">x</span><span className="CopticFont"> `</span><span className="HazzatFont">x</span><span className="CopticFont"> pne</span><span className="HazzatFont">-zz.cd.x</span><span className="CopticFont"> uma</span><span className="HazzatFont">zc </span><span className="CopticFont">`e</span><span className="HazzatFont">x </span><span className="CopticFont">;ou</span><span className="HazzatFont">x</span><span className="CopticFont"> a</span><span className="HazzatFont">zz.x x cd.zc </span><span className="CopticFont"> b@ je</span><span className="HazzatFont">zz.x</span><span className="CopticFont"> a</span><span className="HazzatFont">x x</span><span className="CopticFont"> k`i</span><span className="HazzatFont">zz x</span><span className="CopticFont"> a</span><span className="HazzatFont">x</span><span className="CopticFont"> kcw</span><span className="HazzatFont">x </span><span className="CopticFont">]</span><span className="HazzatFont">zz.cd.c z x x. </span><span className="CopticFont">`</span><span className="HazzatFont">zz</span><span className="CopticFont">mmo</span><span className="HazzatFont">cc </span><span className="CopticFont">n.</span><br />
                </div>
            </section>

            <section id="helpfulTip">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.helpfulTip} />
                </div>
                <div className="clear" />
            </section>

            <div style={{ textAlign: "center", paddingTop: "30px", paddingBottom: "30px" }}>
                <MyNavLink to="#" onClick={() => window.history.back()}>
                    <LocalizedMessage of="goBack" />
                </MyNavLink>
            </div>
        </>
    );
}

export default UsingHazzatFont;
