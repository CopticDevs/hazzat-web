import { useContext, useState } from "react";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import HymnTitle from "./HymnTitle";
import MainPaper, { Size } from "./MainPaper";
import "./ContactUs.css";
import { LanguageContext } from "../LanguageContext";

function ContactUs() {
    const { languageProperties } = useContext(LanguageContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    const handleSubmit = (e: any) => {
        e.preventDefault();
        // Send form data to server or email using a library or API
        console.log(name, email, subject, message);
        // Show confirmation message
        setSubmitted(true);
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setSubmitted(false);
    };

    if (submitted) {
        return (
            <MainPaper size={Size.Wide}>
                <div className="pageTitle"><LocalizedMessage of="contactUs" /></div>
                <div>
                    <h2>Thank you for your feedback!</h2>
                    <p>We will get back to you as soon as possible.</p>
                    <button onClick={resetForm}>Submit another message</button>
                </div>
        </MainPaper>
        );
    }

    // fix according to https://getbootstrap.com/docs/4.3/components/forms/ and localize the above

    return (
        <MainPaper size={Size.Wide}>
            <div className="pageTitle"><LocalizedMessage of="contactUs" /></div>

            <form onSubmit={handleSubmit}>
                <div className="container">
                    <div className={langClassName} style={{ paddingBottom: "20px", paddingTop: "20px" }}>
                        <HymnTitle content={strings.yourContactInfo} />
                    </div>
                    <div className="clear" />
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="nameFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <input className="form-control" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        </label>
                    </div>
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="emailFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </label>
                    </div>
                </div>

                <div className="container">
                    <div className={langClassName} style={{ paddingBottom: "20px", paddingTop: "20px" }}>
                        <HymnTitle content={strings.yourFeedback} />
                    </div>
                    <div className="clear" />
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="subjectFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <input className="form-control" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
                            </div>
                        </label>
                    </div>
                    
                    <div className="row">
                        <label>
                            <div className="col-3 col-md-4">
                                <LocalizedMessage of="messageFormLabel" />
                            </div>
                            <div className="col-9 col-md-8">
                                <textarea className="form-control" value={message} onChange={(e) => setMessage(e.target.value)} />
                            </div>
                        </label>
                    </div>
                </div>
                <button className="btn btn-primary" type="submit"><LocalizedMessage of="submitFormLabel" /></button>
            </form>
        </MainPaper>
    );
}

export default ContactUs;
