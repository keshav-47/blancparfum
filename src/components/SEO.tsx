import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "BLANC PARFUM";
const DEFAULT_DESC = "Discover handcrafted Extrait de Parfum by BLANC PARFUM. Luxury niche fragrances made with the world's rarest ingredients.";
const BASE_URL = "https://blancparfum.lovable.app";
const DEFAULT_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/af60c945-209e-47d7-9d5a-f2069dc56f89/id-preview-c572c1be--5bee3d7d-0f48-44c3-b8b6-a79f79b6ab87.lovable.app-1772971193890.png";

const SEO = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  type = "website",
  image = DEFAULT_IMAGE,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Handcrafted Luxury Fragrances`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
