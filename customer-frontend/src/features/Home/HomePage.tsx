import Page from "../../shared/components/Page";
import FeaturedProducts from "./FeaturedProducts/FeaturedProducts";
import Title from "./Title";

const HomePage = () => {
  return (
    <Page>
      <Title />
      <FeaturedProducts />
    </Page>
  );
};

export default HomePage;
