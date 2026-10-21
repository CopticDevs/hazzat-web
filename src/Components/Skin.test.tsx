import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import LanguageProvider from "../LanguageProvider";
import { strings } from "../l8n";
import { UserSettingProvider, UserSettingsContext } from "../Contexts/UserSettingsContext";
import Header from "./Header";
import Footer from "./Footer";
import FormatOptionsContextMenu from "./FormatOptionsContextMenu";
import FormatBar from "./FormatBar";
import MyNavLink from "./MyNavLink";
import LanguageSwitcher from "./LanguageSwitcher";
import UserSettingsChanger from "./UserSettingsChanger";
import ContentInformation from "./ContentInformation";
import NotationContent from "./NotationContent";
import ContactUsPage from "./ContactUsPage";
import RouteScroll from "./RouteScroll";

const navItems = [{ id: "home", location: "/" }, { id: "seasons", location: "/Seasons" }] as any;
function Location() { const l = useLocation(); return <output data-testid="location">{l.pathname}{l.search}{l.hash}</output>; }
function Settings() { const { userSettings } = useContext(UserSettingsContext); return <output data-testid="settings">{JSON.stringify(userSettings)}</output>; }
beforeEach(() => { HTMLElement.prototype.scrollIntoView = jest.fn(); localStorage.clear(); strings.setLanguage('en'); window.gtag = jest.fn(); });
afterEach(() => { strings.setLanguage('en'); document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr'; jest.restoreAllMocks(); });

test('mobile navigation opens by keyboard, Escape closes and returns focus, and choosing a page closes it', async () => {
    render(<MemoryRouter><Header navItems={navItems} /><Location /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Menu' });
    toggle.focus(); await userEvent.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    screen.getByRole('link', { name: 'Seasons' }).focus(); await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false'); expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}'); userEvent.click(screen.getByRole('link', { name: 'Seasons' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/Seasons');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test.each(['header', 'footer'])('%s menu closes when selecting the current page', placement => {
    render(<MemoryRouter initialEntries={['/Seasons']} >
        {placement === 'header' ? <Header navItems={navItems} /> : <Footer navItems={navItems} />}
        <Location />
    </MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Menu' });
    userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    userEvent.click(screen.getByRole('link', { name: 'Seasons' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('location')).toHaveTextContent('/Seasons');
});

test('footer stays put on mount and reveals its links when opened', () => {
    const scroll = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const reveal = jest.fn();
    const original = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = reveal;
    render(<MemoryRouter><Footer navItems={navItems} /></MemoryRouter>);
    expect(reveal).not.toHaveBeenCalled();
    userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(scroll).not.toHaveBeenCalled();
    expect(reveal).toHaveBeenCalledWith({ block: 'end', behavior: 'auto' });
    HTMLElement.prototype.scrollIntoView = original;
});

test('format dropdown has a native keyboard toggle and preserves language and environment', async () => {
    render(<MemoryRouter initialEntries={['/?lang=ar&env=PPE']}><FormatOptionsContextMenu title="Hymn" formatsMap={{'6':'/video','1':'/text'}} /><Location /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Formats: Hymn' });
    toggle.focus(); await act(async () => { await userEvent.keyboard('{ArrowDown}'); });
    const text = await screen.findByRole('button', { name: 'Text' });
    userEvent.click(text);
    expect(screen.getByTestId('location')).toHaveTextContent('/text?lang=ar&env=PPE');
});

test('format links stay canonical and expose one label and an explicit active page', () => {
    render(<MemoryRouter initialEntries={["/video"]}><FormatBar title="Hymn" formatsMap={{'6':'/video','1':'/text','3':'/vertical'}} activeFormatId="6" /></MemoryRouter>);
    const links = within(screen.getByRole('navigation', { name: 'Formats' })).getAllByRole('link');
    expect(links).toEqual(['Text','Vertical Hazzat','Video'].map(name => screen.getByRole('link', { name }))); 
    expect(links[2]).toHaveAttribute('aria-current', 'page');
    expect(within(links[2]).queryByRole('img')).not.toBeInTheDocument();
});

test('relative links and hashes retain their route semantics, explicit queries, and anchor attributes', () => {
    render(<MemoryRouter initialEntries={['/Fonts?lang=ar&env=PPE']}><Routes><Route path="/Fonts/*" element={<>
        <MyNavLink to="HazzatFont?lang=en" aria-label="Font details">Font</MyNavLink>
        <MyNavLink to="#usage">Usage</MyNavLink>
    </>} /></Routes></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Font details' })).toHaveAttribute('href','/Fonts/HazzatFont?lang=en&env=PPE');
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('href','/Fonts?lang=ar&env=PPE#usage');
});

test('changing language updates document semantics without resetting reader preferences', async () => {
    render(<MemoryRouter><LanguageProvider><UserSettingProvider><ul><LanguageSwitcher /></ul><UserSettingsChanger /><Settings /><Location /></UserSettingProvider></LanguageProvider></MemoryRouter>);
    userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    userEvent.click(screen.getByRole('button', { name: 'Increase text size' }));
    userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    userEvent.click(screen.getByRole('link', { name: 'اللغة العربية' }));
    expect(document.documentElement).toHaveAttribute('lang', 'ar');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('settings')).toHaveTextContent('20px');
    expect(screen.getByTestId('location')).toHaveTextContent('?lang=ar');
    userEvent.click(screen.getByRole('link', { name: 'English' }));
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
});

test('information shares reader size/color settings and preferences survive remounting', async () => {
    const content = [{ id:'i', name:'Info', displayName:'Info', content:{englishInformation:'English information',arabicInformation:'معلومات'} }] as any;
    const view = render(<UserSettingProvider><UserSettingsChanger /><ContentInformation variations={content} /></UserSettingProvider>);
    userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: 'Increase text size' }));
    expect(screen.getByText('English information')).toHaveStyle({fontSize:'20px'});
    expect(screen.getByText('معلومات')).toHaveStyle({fontSize:'24px'});
    userEvent.click(within(screen.getByRole('group', { name: 'Text' })).getByRole('radio', { name:'Navy' }));
    expect(screen.getByText('English information')).toHaveStyle({color:'NAVY'});
    view.unmount(); render(<UserSettingProvider><Settings /></UserSettingProvider>);
    expect(screen.getByTestId('settings')).toHaveTextContent('20px');
    expect(screen.getByTestId('settings')).toHaveTextContent('NAVY');
});

test.each(['broken json', JSON.stringify({size:999,contentFontColor:'invalid',hazzatFontColor:'invalid'})])('invalid stored preferences cannot break the reader', saved => {
    localStorage.setItem('hazzat.reader-settings', saved);
    render(<UserSettingProvider><Settings /></UserSettingProvider>);
    expect(screen.getByTestId('settings')).toHaveTextContent('18px');
    expect(screen.getByTestId('settings')).toHaveTextContent('BLACK');
});

test('notation uses a keyboard reachable RTL scroll region and retains encoded musical HTML', () => {
    const content = '<span class="HazzatVAFont">ى.ىىىىءزىىىءز+ىء</span><br><span class="ArabicFont">صلاة</span>';
    const { container } = render(<NotationContent content={content} language="ar" style={{fontSize:'30px'}} />);
    const region = screen.getByRole('region', { name: strings.notationScroll });
    expect(region).toHaveAttribute('dir','rtl'); expect(region).toHaveAttribute('tabindex','0');
    expect(region.innerHTML).toBe(content);
    expect(container.querySelectorAll('.HazzatVAFont')).toHaveLength(1);
});

test('the retired contact form cannot falsely acknowledge an unsent message', () => {
    render(<ContactUsPage />);
    expect(screen.getByRole('status')).toHaveTextContent('No message has been sent');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('new navigation starts at the top and Back restores the prior reading position', async () => {
    const scroll = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { callback(0); return 0; });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    let position = 0;
    const original = Object.getOwnPropertyDescriptor(window, 'scrollY')!;
    Object.defineProperty(window, 'scrollY', { configurable:true, get:() => position });
    function Controls() { const navigate = useNavigate(); return <><button onClick={() => navigate('/next')}>Next</button><button onClick={() => navigate(-1)}>Back</button></>; }
    const view = render(<MemoryRouter><RouteScroll /><Controls /><Location /></MemoryRouter>);
    position = 420; fireEvent.scroll(window);
    userEvent.click(screen.getByRole('button', {name:'Next'}));
    expect(scroll).toHaveBeenLastCalledWith({top:0,behavior:'auto'});
    userEvent.click(screen.getByRole('button', {name:'Back'}));
    expect(scroll).toHaveBeenLastCalledWith({top:420,behavior:'auto'});
    view.unmount(); Object.defineProperty(window, 'scrollY', original);
});


test('visible icon format links change format without dropping query parameters', () => {
    render(<MemoryRouter initialEntries={['/video?lang=ar&env=PPE']}><FormatBar title="Hymn" formatsMap={{'6':'/video','1':'/text'}} activeFormatId="6" /><Location /></MemoryRouter>);
    const textLink = screen.getByRole('link', { name: 'Text' });
    expect(textLink.querySelector('svg')).not.toBeNull();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    userEvent.click(textLink);
    expect(screen.getByTestId('location')).toHaveTextContent('/text?lang=ar&env=PPE');
});


test('settings closes immediately and restores focus to its trigger', () => {
    render(<UserSettingProvider><UserSettingsChanger /></UserSettingProvider>);
    const trigger = screen.getByRole('button', { name: 'Settings' });
    userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
});
