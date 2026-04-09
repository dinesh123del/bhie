import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Biz Plus — Official Global Launch 2026',
  description = 'Biz Plus: Autonomous business analytics live worldwide. Track profit, loss, and drive smart decisions with our automated bill scanner.',
  keywords = 'Biz Plus, Business Health, Global Launch, AI Scanner, Small Business Accounting, Financial Intelligence',
  image = 'https://bizplus.ai/logo-mark.png',
  url = 'https://bizplus.ai',
  type = 'website'
}) => {
  const siteTitle = title.includes('Biz Plus') ? title : `${title} | Biz Plus`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical Link */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
