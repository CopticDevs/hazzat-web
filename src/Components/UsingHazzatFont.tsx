import { useContext, useEffect } from "react";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import BreadCrumb from "./BreadCrumb";
import HelpTip from "./HelpTip";
import HymnTitle from "./HymnTitle";
import MyNavLink from "./MyNavLink";
import "./UsingHazzatFont.css";

interface IMappingGridItem {
    key: string;
    isInplace?: boolean;
    description: string;
}

function UsingHazzatFont() {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";
    const padLangClassName = languageProperties.isRtl ? "padRight" : "padLeft";
    const mappings: IMappingGridItem[] = [
        { key: "z", description: `${strings.oneNote}<br />${strings.firstExtender}` },
        { key: "x", description: strings.twoNotes },
        { key: "c", description: strings.threeNotes },
        { key: "v", description: strings.fourNotes },
        { key: "b", description: strings.fiveNotes },
        { key: "n", description: strings.sixNotes },
        { key: "m", description: strings.sevenNotes },
        { key: "q", description: strings.oneShortNote },
        { key: "w", description: strings.twoShortNotes },
        { key: "e", description: strings.threeShortNotes },
        { key: "r", description: strings.fourShortNotes },
        { key: "t", description: strings.fiveShortNotes },
        { key: "y", description: strings.sixShortNotes },
        { key: "u", description: strings.sevenShortNotes },
        { key: "s", description: strings.secondExtender },
        { key: "d", description: strings.thirdExtender },
        { key: "f", description: strings.fourthExtender },
        { key: "g", description: strings.fifthExtender },
        { key: "h", description: strings.sixthExtender },
        { key: "Z", description: `${strings.seventhExtender}<br />${strings.oneHighNote}` },
        { key: "X", description: strings.twoHighNotes },
        { key: "C", description: strings.threeHighNotes },
        { key: "V", description: strings.fourHighNotes },
        { key: "B", description: strings.fiveHighNotes },
        { key: "N", description: strings.sixHighNotes },
        { key: "A", isInplace: true, description: strings.secondVibrated },
        { key: "S", isInplace: true, description: strings.thirdVibrated },
        { key: "D", isInplace: true, description: strings.fourthVibrated },
        { key: "F", isInplace: true, description: strings.fifthVibrated },
        { key: "G", isInplace: true, description: strings.sixthVibrated },
        { key: "a", description: strings.abruptNote },
        { key: "j", isInplace: true, description: strings.fastUnderscore },
        { key: "J", isInplace: true, description: strings.fastArrow },
        { key: ".", description: strings.pauseMark },
        { key: "+", description: strings.higherTone },
        { key: "-", description: strings.lowerTone },
        { key: "1", description: strings.repeatOne },
        { key: "2", description: strings.repeatTwo },
        { key: "3", description: strings.repeatThree },
        { key: "4", description: strings.repeatFour },
        { key: "5", description: strings.repeatFive },
        { key: "6", description: strings.repeatSix },
        { key: "7", description: strings.repeatSeven },
        { key: "8", description: strings.repeatEight },
        { key: "9", description: strings.repeatNine },
        { key: "0", description: strings.zeroNote },
        { key: "!", description: strings.markOne },
        { key: "@", description: strings.markTwo },
        { key: "#", description: strings.markThree },
        { key: "$", description: strings.markFour },
        { key: "%", description: strings.markFive },
        { key: "^", description: strings.markSix },
        { key: "&", description: strings.markSeven },
    ];

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

            <section id="aboutHelp" className="helpSection">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.aboutHelp} />
                </div>
                <div className="clear" />
                <p><LocalizedMessage of="aboutHelpContent" /></p>
            </section>

            <section id="aboutHazzat" className="helpSection">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.aboutHazzat} />
                </div>
                <div className="clear" />
                <p dangerouslySetInnerHTML={{ __html: strings.hazzatFontReason }} />
                <p dangerouslySetInnerHTML={{ __html: strings.hazzatAdvantagesList }} />
                <p dangerouslySetInnerHTML={{ __html: strings.hazzatDescSummary }} />
            </section>

            <section id="keymappings" className="helpSection">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.keyMappings} />
                </div>
                <div className="clear" />
                <table>
                    <thead>
                        <th className="border" style={{ width: "50px" }}><LocalizedMessage of="key" /></th>
                        <th className="border" style={{ width: "72px" }}><LocalizedMessage of="symbol" /></th>
                        <th className="border" style={{ width: "300px" }}><LocalizedMessage of="description" /></th>
                    </thead>
                    <tbody>
                    {mappings.map((item) => {
                        return (
                            <tr>
                                <td className="border p-2"><span style={{ fontSize: "29pt" }}>{item.key}</span></td>
                                <td className="border p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>{item.isInplace ? <>&nbsp;</> : ""}{item.key}</span></td>
                                <td className="border p-2" dangerouslySetInnerHTML={{ __html: item.description }} />
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </section>

            <section id="usage" className="helpSection">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.usage} />
                </div>
                <div className="clear" />
            </section>

            <section id="regularNotes" className="helpSection">
                <p><u><LocalizedMessage of="regularNotes" /></u></p>
                <p><LocalizedMessage of="regularDesc1" /></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>z</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>z</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="oneNote" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>x</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>x</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="twoNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>c</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>c</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="threeNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>v</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>v</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fourNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>b</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>b</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fiveNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>n</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>n</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="sixNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>m</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>m</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="sevenNotes" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <HelpTip content={strings.regularTip} />
                <p><LocalizedMessage of="regularDesc2" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>ccc</span>&nbsp; &nbsp;(<LocalizedMessage of="threeLongNotes" />)</p>
                <p><LocalizedMessage of="regularDesc3" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xc</span>&nbsp; &nbsp;(<LocalizedMessage of="twoLongOneReg" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>zv</span>&nbsp; &nbsp;(<LocalizedMessage of="oneLongThreeReg" />)</p>
                <p>&nbsp;</p>
            </section>

            <section id="shortNotes" className="helpSection">
                <p><u><LocalizedMessage of="shortNotes" /></u></p>
                <p><LocalizedMessage of="shortDesc1" /></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>q</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>q</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="oneShortNote" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>w</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>w</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="twoShortNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>e</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>e</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="threeShortNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>r</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>r</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fourShortNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>t</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>t</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fiveShortNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>y</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>y</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="sixShortNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>u</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>u</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="sevenShortNotes" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <HelpTip content={strings.shortTip} />
            </section>

            <section id="highNotes" className="helpSection">
                <p><u><LocalizedMessage of="highNotes" /></u></p>
                <p><LocalizedMessage of="highDesc1" /></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>Z</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>Z</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="oneHighNote" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>X</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>X</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="twoHighNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>C</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>C</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="threeHighNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>V</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>V</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fourHighNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>B</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>B</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fiveHighNotes" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>N</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>N</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="sixHighNotes" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <HelpTip content={strings.highTip} />
                <p><LocalizedMessage of="regularDesc2" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>XC</span>&nbsp; &nbsp;(<LocalizedMessage of="twoLongOneReg" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>ZV</span>&nbsp; &nbsp;(<LocalizedMessage of="oneLongThreeReg" />)</p>
            </section>

            <section id="regularExtend" className="helpSection">
                <p><u><LocalizedMessage of="regularExtend" /></u></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>s</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>s</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="secondExtender" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>d</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>d</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="thirdExtender" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>f</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>f</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fourthExtender" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>g</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>g</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fifthExtender" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>h</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>h</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="sixthExtender" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <HelpTip content={strings.extendTip1} />
                <HelpTip content={strings.extendTip2} />
            </section>

            <section id="vibratedNotes" className="helpSection">
                <p><u><LocalizedMessage of="vibratedNotes" /></u></p>
                <p><LocalizedMessage of="vibratedDesc1" /></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>A</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}> A</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="secondVibrated" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>S</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}> S</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="thirdVibrated" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>D</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}> D</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fourthVibrated" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>F</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}> F</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fifthVibrated" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>G</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}> G</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="sixthVibrated" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <p><LocalizedMessage of="vibratedDesc2" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xS</span>&nbsp; &nbsp;(<LocalizedMessage of="twoRegOneVib" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>cDcD</span>&nbsp; &nbsp;(<LocalizedMessage of="threeLongOneLongVib" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xS S</span>&nbsp; &nbsp;(<LocalizedMessage of="twoRegOneLongVib" />)</p>
                <p>&nbsp; &nbsp;(<LocalizedMessage of="spaceBeforeTheSecondVib" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xS D</span>&nbsp; &nbsp;(<LocalizedMessage of="twoRegOneVibHigher" />)</p>
                <p>&nbsp; &nbsp;(<LocalizedMessage of="spaceBeforeTheSecondVib" />)</p>
                <HelpTip content={strings.vibratedTip1} />
                <p><LocalizedMessage of="vibratedDesc3" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}> AS</span>&nbsp; &nbsp;(<LocalizedMessage of="twoVib" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}> ASD ASD</span>&nbsp; &nbsp;(<LocalizedMessage of="threeLongVib" />)</p>
                <p>&nbsp; &nbsp;(<LocalizedMessage of="spaceBeforeSecondSet" />)</p>
                <p><LocalizedMessage of="vibratedDesc4" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xSD</span>&nbsp; &nbsp;(<LocalizedMessage of="twoRegTwoVib" />)</p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xSDxSD</span>&nbsp; &nbsp;(<LocalizedMessage of="twoLongTwoLongVib" />)</p>
            </section>

            <section id="specialChars">
                <p><u><LocalizedMessage of="specialChars" /></u></p>
            </section>

            <section id="abrupt" className="helpSection">
                <p><u><LocalizedMessage of="abrupt" /></u></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>a</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>a</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="abruptNote" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <p><LocalizedMessage of="example" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>xav</span>&nbsp; &nbsp;(<LocalizedMessage of="twoAbruptFour" />)</p>
                <p><span className="CopticFont" style={{ fontSize: "29pt" }}>ebo</span><span className="HazzatFont" style={{ fontSize: "29pt" }}>ca</span><span className="CopticFont" style={{ fontSize: "29pt" }}>l qen</span>&nbsp; &nbsp;(<LocalizedMessage of="threeRegularAbruptHymn" />)</p>
            </section>

            <section id="fastChant" className="helpSection">
                <p><u><LocalizedMessage of="fastChant" /></u></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>j</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}> j</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fastUnderscore" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>J</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}> J</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fastArrow" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <p><LocalizedMessage of="fastDesc1" /></p>
                <p><span className="CopticFont" style={{ fontSize: "29pt" }}>ebol q</span><span className="HazzatFont" style={{ fontSize: "29pt" }}>j</span><span className="CopticFont" style={{ fontSize: "29pt" }}>e</span><span className="HazzatFont" style={{ fontSize: "29pt" }}>j</span><span className="CopticFont" style={{ fontSize: "29pt" }}>n</span><span className="HazzatFont" style={{ fontSize: "29pt" }}>J</span>&nbsp; &nbsp;(<LocalizedMessage of="fastExample" />)</p>
            </section>

            <section id="breathMark" className="helpSection">
                <p><u><LocalizedMessage of="breathMark" /></u></p>
                <tbody>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>.</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatFont" style={{ fontSize: "29pt" }}>.</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="pauseMark" />)</span></td>
                    </tr>
                </tbody>
                <p><LocalizedMessage of="example" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>cd.v c</span>&nbsp; &nbsp;(<LocalizedMessage of="pauseExample" />)</p>
            </section>

            <section id="lowerOrHigher" className="helpSection">
                <p><u><LocalizedMessage of="lowerOrHigher" /></u></p>
            </section>

            <section id="repeatMark" className="helpSection">
                <p><u><LocalizedMessage of="repeatMark" /></u></p>
            </section>

            <section id="markingChars" className="helpSection">
                <p><u><LocalizedMessage of="markingChars" /></u></p>
            </section>

            <section id="exampleHymn" className="helpSection">
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

            <section id="helpfulTip" className="helpSection">
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
