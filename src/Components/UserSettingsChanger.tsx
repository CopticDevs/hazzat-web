import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Button, Modal } from 'react-bootstrap';
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import CircleButton from "./CircleButton";
import "./UserSettingsChanger.css";

interface IRadioOption {
    value: string;
    label: string;
}

function UserSettingsChanger() {
    const { languageProperties } = useContext(LanguageContext);
    const { userSettings, setHazzatFontColor, setContentFontColor, setContentFontSize } = useContext(UserSettingsContext);
    const [selectedHazzatColor, setSelectedHazzatColor] = useState(userSettings.hazzatFontColor);
    const [selectedContentColor, setSelectedContentColor] = useState(userSettings.contentFontColor);
    const [expanded, setExpanded] = useState(false);
    const [selectedFontSize, setSelectedFontSize] = useState<number>(18);
    const langDirName = languageProperties.isRtl ? "dirRtl" : "dirLtr";

    const handleToggleModal = () => {
        setExpanded(!expanded);
    };

    const overrideEnglishStyle = {
        '--english-font-size': userSettings.englishFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'ltr',
    } as React.CSSProperties & { '--english-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

    const overrideArabicStyle = {
        '--arabic-font-size': userSettings.arabicFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'rtl',
    } as React.CSSProperties & { '--arabic-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

    const options: IRadioOption[] = [
        { value: 'BLACK', label: strings.black },
        { value: 'MAROON', label: strings.maroon },
        { value: 'NAVY', label: strings.navy },
    ];

    const handleHazzatColorChange = (color: string) => {
        setSelectedHazzatColor(color);
        setHazzatFontColor(color);
    };

    const handleContentColorChange = (color: string) => {
        setSelectedContentColor(color);
        setContentFontColor(color);
    };

    const handleTextSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const num = +event.target.value;
        setSelectedFontSize(num);
        setContentFontSize(num);
    };

    return (
        <>
            {!expanded &&
                <Button
                    onClick={handleToggleModal}
                    className="modal-toggle"
                    style={{ width: "45px" }}
                >
                    <FontAwesomeIcon icon={faCog} className="text-dark" />
                </Button>}
            <Modal show={expanded} onHide={handleToggleModal} animation={true} size="lg" className={langDirName}>
                <Modal.Header closeButton>
                    <Modal.Title><LocalizedMessage of="settings" /></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="container-fluid">
                            <div className="row">
                                <div><strong><LocalizedMessage of="textFormatName" /></strong></div>
                            </div>
                            <div className="row">
                                {options.map((option) => (
                                    <CircleButton
                                        key={option.value}
                                        fill={option.value}
                                        active={selectedContentColor === option.value}
                                        setActive={() => handleContentColorChange(option.value)}
                                    />
                                ))}
                            </div>

                            <div className="row" style={{ paddingTop: "10px" }}>
                                <div><strong><LocalizedMessage of="hazzatFormatName" /></strong></div>
                            </div>
                            <div className="row">
                                {options.map((option) => (
                                    <CircleButton
                                        key={option.value}
                                        fill={option.value}
                                        active={selectedHazzatColor === option.value}
                                        setActive={() => handleHazzatColorChange(option.value)}
                                    />
                                ))}
                            </div>
                            <div className="row" style={{ paddingTop: "10px" }}>
                                <div><strong><LocalizedMessage of="size" /></strong></div>
                            </div>
                            <div className="row">
                                <input
                                    type="range"
                                    className="form-range"
                                    id="sizeRange"
                                    name="range-control"
                                    min="10"
                                    max="26"
                                    step="2"
                                    value={selectedFontSize}
                                    onChange={handleTextSizeChange}
                                />
                            </div>
                        </div>
                    </form>                    
                    <div className="m-4">
                        <Modal.Title as="h5"><LocalizedMessage of="sample" /></Modal.Title>
                        <div className="border p-4 m-4">
                            <div style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: strings.sampleCoptic }} />
                            <div style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: strings.sampleEnglish }} />
                            <div style={overrideArabicStyle} dangerouslySetInnerHTML={{ __html: strings.sampleArabic }} />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default UserSettingsChanger;
