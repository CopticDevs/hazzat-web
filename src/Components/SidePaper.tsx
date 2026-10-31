import { useContext } from "react";
import { ReactComponent as YoutubeIcon } from "../images/youtube.svg";
import { ReactComponent as TwitterIcon } from "../images/twitter.svg";
import { ReactComponent as FacebookIcon } from "../images/facebook.svg";
import { ReactComponent as SoundCloudIcon } from "../images/soundcloud.svg";
import { LanguageContext } from "../LanguageContext";
import HymnTitle from "./HymnTitle";
import { strings } from "../l8n";
import "./SidePaper.css";

function SidePaper() {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "dirRtl" : "";

    return (
        <aside className={`hymnLeft ${langClassName}`} aria-label={strings.downloadTheApp}>

            <div className="hymnRep clearfix">

                {/* Mobile App Links */}
                <div className="mobile-app-links">
                    <HymnTitle content={strings.downloadTheApp} />
                    <div className="app-store-buttons">
                        <a 
                            href="https://apps.apple.com/us/app/hazzat-app/id6753879416"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img 
                                src="/images/app-store-badge.svg" 
                                alt="Download on the App Store"
                                className="app-store-button"
                            />
                        </a>
                        <a 
                            href="https://play.google.com/store/apps/details?id=com.hazzat.hazzatandroidapp&pcampaignid=web_share"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img 
                                src="/images/google-play-badge.png" 
                                alt="Get it on Google Play"
                                className="google-play-button"
                            />
                        </a>
                    </div>
                </div>

                <HymnTitle content={strings.followUs} />
                <div className="socialMedia clearfix social-media-section">

                    <a aria-label="Facebook" href="https://www.facebook.com/hazzat.com" target="_blank" rel="noreferrer">
                        <FacebookIcon aria-hidden="true" focusable="false" />
                    </a>

                    <a aria-label="Twitter" href="https://www.twitter.com/CopticHazzat" target="_blank" rel="noreferrer">
                        <TwitterIcon aria-hidden="true" focusable="false" />
                    </a>

                    <a aria-label="YouTube" href="https://www.youtube.com/CopticHazzat" target="_blank" rel="noreferrer">
                        <YoutubeIcon aria-hidden="true" focusable="false" />
                    </a>

                    <a aria-label="SoundCloud" href="https://soundcloud.com/coptichazzat" target="_blank" rel="noreferrer">
                        <SoundCloudIcon aria-hidden="true" focusable="false" />
                    </a>

                </div>

            </div>

        </aside>
    );
}

export default SidePaper;
