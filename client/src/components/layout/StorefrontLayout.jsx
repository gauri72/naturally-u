import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header.jsx';
import FooterBlock from '../../blocks/FooterBlock/FooterBlock.jsx';
import AnnouncementBarBlock from '../../blocks/AnnouncementBarBlock/AnnouncementBarBlock.jsx';
import ScrollToTop from '../common/ScrollToTop.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';
import { getSettings } from '../../api/settings.api';

// Wraps every public storefront page. The announcement bar sits above
// the Header (sitewide, sourced from Settings). Header is a fixed
// structural component (not CMS-editable in this scope); Footer reuses
// the FooterBlock since it's globally driven by Settings.
function StorefrontLayout() {
  const [announcementBar, setAnnouncementBar] = useState(null);

  useEffect(() => {
    getSettings()
      .then((res) => setAnnouncementBar(res.data.announcementBar))
      .catch(() => setAnnouncementBar(null));
  }, []);

  return (
    <>
      <ScrollToTop />
      {announcementBar?.enabled && (
        <AnnouncementBarBlock messages={announcementBar.messages} />
      )}
      <Header />
      <main>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <FooterBlock />
      <LanguageSwitcher />
    </>
  );
}

export default StorefrontLayout;
