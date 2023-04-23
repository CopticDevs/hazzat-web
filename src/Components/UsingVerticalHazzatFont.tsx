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

function UsingVerticalHazzatFont() {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";
    const padLangClassName = languageProperties.isRtl ? "padRight" : "padLeft";
    const mappings: IMappingGridItem[] = [
        { key: "z", description: strings.oneShortNote },
        { key: "x", description: strings.oneNote },
        { key: "q", description: strings.oneShortVibrated },
        { key: "w", description: strings.oneVibrated },
        { key: "c", description: strings.verticalExtension },
        { key: "a", description: strings.abruptNote },
        { key: "j", isInplace: true, description: strings.fastUnderscore },
        { key: "k", isInplace: true, description: strings.fastArrow },
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
        document.title = strings.usingTheVerticalHazzatFont + " - hazzat.com";
    }, []);

    return (
        <>
            <div className="pageTitle"><LocalizedMessage of="usingTheVerticalHazzatFont" /></div>
            <BreadCrumb items={[
                { title: strings.help, path: "/Help" },
                { title: strings.usingTheVerticalHazzatFont }]} />

            <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                <HymnTitle content={strings.topics} />
            </div>
            <div className="clear" />
            <p style={{ paddingBottom: "33px" }}>
                <a href="#aboutHelp"><LocalizedMessage of="aboutHelp" /></a><br />
                <a href="#aboutVerticalHazzat"><LocalizedMessage of="aboutVerticalHazzat" /></a><br />
                <a href="#keymappings"><LocalizedMessage of="keyMappings" /></a><br />
                <a href="#usage"><LocalizedMessage of="usage" /></a><br />
                <div className={padLangClassName}>
                    <a href="#regularNotes"><LocalizedMessage of="regularNotes" /></a><br />
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

            <section id="aboutVerticalHazzat" className="helpSection">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.aboutVerticalHazzat} />
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
                                    <td className="border p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>{item.isInplace ? <>&nbsp;</> : ""}{item.key}</span></td>
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
                <p><LocalizedMessage of="regularVerticalDesc1" /></p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>xczx</span></p>
            </section>

            <section id="vibratedNotes" className="helpSection">
                <p><u><LocalizedMessage of="vibratedNotes" /></u></p>
                <p><LocalizedMessage of="vibratedVerticalDesc1" /></p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>xwzxcq</span></p>
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
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>a</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="abruptNote" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <p><LocalizedMessage of="example" /></p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>xxaxxxx</span>&nbsp; &nbsp;(<LocalizedMessage of="twoAbruptFour" />)</p>
                <p><span className="CopticFont" style={{ fontSize: "29pt" }}>ebo</span><span className="HazzatVFont" style={{ fontSize: "29pt" }}>xxxa</span><span className="CopticFont" style={{ fontSize: "29pt" }}>l qen</span>&nbsp; &nbsp;(<LocalizedMessage of="threeRegularAbruptHymn" />)</p>
            </section>

            <section id="fastChant" className="helpSection">
                <p><u><LocalizedMessage of="fastChant" /></u></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>j</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}> j</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fastUnderscore" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>k</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}> k</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="fastArrow" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <p><LocalizedMessage of="fastDesc1" /></p>
                <p><span className="CopticFont" style={{ fontSize: "29pt" }}>ebol q</span><span className="HazzatVFont" style={{ fontSize: "29pt" }}>j</span><span className="CopticFont" style={{ fontSize: "29pt" }}>e</span><span className="HazzatVFont" style={{ fontSize: "29pt" }}>j</span><span className="CopticFont" style={{ fontSize: "29pt" }}>n</span><span className="HazzatVFont" style={{ fontSize: "29pt" }}>k</span>&nbsp; &nbsp;(<LocalizedMessage of="fastExample" />)</p>
            </section>

            <section id="breathMark" className="helpSection">
                <p><u><LocalizedMessage of="breathMark" /></u></p>
                <tbody>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>.</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>.</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="pauseMark" />)</span></td>
                    </tr>
                </tbody>
                <p><LocalizedMessage of="example" /></p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>xxc.xxxx xxx</span>&nbsp; &nbsp;(<LocalizedMessage of="pauseExample" />)</p>
            </section>

            <section id="lowerOrHigher" className="helpSection">
                <p><u><LocalizedMessage of="lowerOrHigher" /></u></p>
                <tbody>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>+</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>+</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="higherTone" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>-</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>-</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="lowerTone" />)</span></td>
                    </tr>
                </tbody>
                <p><LocalizedMessage of="example" /></p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>xxxc.+xxxx xxx</span>&nbsp; &nbsp;(<LocalizedMessage of="highExample" />)</p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>xxxc.-xxxx xxx</span>&nbsp; &nbsp;(<LocalizedMessage of="lowExample" />)</p>
            </section>

            <section id="repeatMark" className="helpSection">
                <p><u><LocalizedMessage of="repeatMark" /></u></p>
                <tbody>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>1</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>1</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatOne" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>2</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>2</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatTwo" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>3</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>3</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatThree" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>4</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>4</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatFour" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>5</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>5</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatFive" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>6</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>6</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatSix" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>7</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>7</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatSeven" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>8</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>8</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatEight" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>9</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>9</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="repeatNine" />)</span></td>
                    </tr>
                    <tr>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}>0</span></td>
                        <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                        <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>0</span></td>
                        <td className="p-2"><span>(<LocalizedMessage of="zeroNote" />)</span></td>
                    </tr>
                </tbody>
                <p><LocalizedMessage of="example" /></p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>(xxxc.xxxx xxx)3</span>&nbsp; &nbsp;(<LocalizedMessage of="repeatExample1" />)</p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>(xxxc.xxxx xxx)7</span>&nbsp; &nbsp;(<LocalizedMessage of="repeatExample2" />)</p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>(xxxc.xxxx xxx)10</span>&nbsp; &nbsp;(<LocalizedMessage of="repeatExample3" />)</p>
            </section>

            <section id="markingChars" className="helpSection">
                <p><u><LocalizedMessage of="markingChars" /></u></p>
                <table>
                    <tbody>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>!</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>!</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="markOne" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>@</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>@</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="markTwo" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>#</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>#</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="markThree" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>$</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>$</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="markFour" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>%</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>%</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="markFive" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>^</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>^</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="markSix" />)</span></td>
                        </tr>
                        <tr>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}>&</span></td>
                            <td className="p-2"><span style={{ fontSize: "29pt" }}><LocalizedMessage of="for" /></span></td>
                            <td className="p-2 dirLtr"><span className="HazzatVFont" style={{ fontSize: "29pt" }}>&</span></td>
                            <td className="p-2"><span>(<LocalizedMessage of="markSeven" />)</span></td>
                        </tr>
                    </tbody>
                </table>
                <HelpTip content={strings.markTip1} />
                <p><LocalizedMessage of="example" /></p>
                <p><span className="HazzatVFont" style={{ fontSize: "29pt" }}>(xxxc.xxxx xxx)#</span>&nbsp; &nbsp;(<LocalizedMessage of="markExample1" />)</p>
                <p><LocalizedMessage of="markDesc1" /></p>
                <p><span className="HazzatFont" style={{ fontSize: "29pt" }}>(...)#</span>&nbsp; &nbsp;(<LocalizedMessage of="referenceExample1" />)</p>
            </section>

            <section id="exampleHymn" className="helpSection">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.exampleHymn} />
                </div>
                <div className="clear" />
                <div className="dirLtr border p-3">
                    <span className="CopticFont">`K`cmarwout aly;wc@ nem Pekiwt `n`aga;oc@ nem Pi`pneuma `e;ouab@ je ak`i akcw] `mmon.</span> <br />
                    <br />
                    <span className="CopticFont">`</span><span className="HazzatVFont">x</span><span className="CopticFont">K`</span><span className="HazzatVFont">xcxc</span><span className="CopticFont">cma</span><span className="HazzatVFont">xcwc.xcxc xc</span><span className="CopticFont">rw</span><span className="HazzatVFont">j</span><span className="CopticFont">o</span><span className="HazzatVFont">j</span><span className="CopticFont">u</span><span className="HazzatVFont">k xc.xcxc</span><span className="CopticFont">t `a</span><span className="HazzatVFont">xc.xxxc.xx</span><span className="CopticFont">ly</span><span className="HazzatVFont">xc xx.xx xx</span><span className="CopticFont">;w</span><span className="HazzatVFont">xc xx.+xcxx</span><span className="CopticFont">c@ ne</span><span className="HazzatVFont">xc xx</span><span className="CopticFont">m Pe</span><span className="HazzatVFont">xx xx</span><span className="CopticFont">kiw</span><span className="HazzatVFont">+xc.xx</span><span className="CopticFont">t `</span><span className="HazzatVFont">xcxc</span><span className="CopticFont">n`a</span><span className="HazzatVFont">xc.xxxc.+xx</span><span className="CopticFont">ga</span><span className="HazzatVFont">xc xx xx xx</span><span className="CopticFont">;o</span><span className="HazzatVFont">xc xx.+xcxx</span><span className="CopticFont">c@ ne</span><span className="HazzatVFont">xc xx </span><span className="CopticFont">m Pi</span><span className="HazzatVFont">xx </span><span className="CopticFont">`</span><span className="HazzatVFont">xx</span><span className="CopticFont">pne</span><span className="HazzatVFont">-xc.xxxc.xx</span><span className="CopticFont">uma</span><span className="HazzatVFont">xcxx</span><span className="CopticFont"> e</span><span className="HazzatVFont">xx</span><span className="CopticFont">;ou</span><span className="HazzatVFont">xx</span><span className="CopticFont">a</span><span className="HazzatVFont">xc.xx xx xxxc.xcxx</span><span className="CopticFont">b@ je</span><span className="HazzatVFont">xc.xx</span><span className="CopticFont"> a</span><span className="HazzatVFont">xx xx</span><span className="CopticFont">k`i</span><span className="HazzatVFont">xc xx</span><span className="CopticFont"> a</span><span className="HazzatVFont">xx</span><span className="CopticFont">kcw</span><span className="HazzatVFont">xx</span><span className="CopticFont">]</span><span className="HazzatVFont">xc.xxxc.xxx x xx xx.</span><span className="CopticFont"> `</span><span className="HazzatVFont">xc</span><span className="CopticFont">mmo</span><span className="HazzatVFont">xcxcxc</span><span className="CopticFont">n.</span><br />
                </div>
            </section>

            <section id="helpfulTip" className="helpSection">
                <div className={langClassName} style={{ paddingBottom: "33px", paddingTop: "33px" }}>
                    <HymnTitle content={strings.helpfulTip} />
                </div>
                <div className="clear" />
                <p dangerouslySetInnerHTML={{ __html: strings.helpfulTipVerticalDesc1 }}></p>
            </section>

            <div style={{ textAlign: "center", paddingTop: "30px", paddingBottom: "30px" }}>
                <MyNavLink to="#" onClick={() => window.history.back()}>
                    <LocalizedMessage of="goBack" />
                </MyNavLink>
            </div>
        </>
    );
}

export default UsingVerticalHazzatFont;
