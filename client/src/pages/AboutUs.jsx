import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | TourMyGarage</title>
        <meta
          name="description"
          content="Learn more about TourMyGarage — a community for gearheads, collectors, and enthusiasts to share their rides and stories."
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">About Us</h1>

        <p className="mb-4 text-lg leading-relaxed">
          Welcome to{' '}
          <Link to="/" className="font-semibold text-blue-600 hover:underline">
            TourMyGarage
          </Link>{' '}
          - an online hangout for gearheads, collectors, and anyone who loves
          cars, bikes, or anything moving down the road with an engine.
        </p>

        <p className="mb-4 text-lg leading-relaxed">
          Think about all the incredible machines you usually only see for sale
          or catch a glimpse of on the road. Here, owners can introduce their
          rides to the world—even if you’re halfway across the globe. I built
          TourMyGarage as a fun, easygoing space where you can create your own{' '}
          <em>virtual garage</em>. Snap a few photos, upload your favorite
          rides, and show off your collection—it’s all just for fun. Each user
          gets a personalized page to post vehicle pics, add descriptions, and
          share the stories behind their machines.
        </p>

        <p className="mb-4 text-lg leading-relaxed">
          If you admire a garage or a particular ride, you can leave a message
          to connect with the owner. Looking for something to do offline? Check
          out our{' '}
          <Link
            to="/events"
            className="text-blue-600 font-semibold hover:underline"
          >
            Events
          </Link>{' '}
          page — it’s a community calendar of upcoming car shows, meetups, and
          automotive events.
        </p>

        <p className="mb-4 text-lg leading-relaxed">
          At TourMyGarage, it’s all about sharing the passion. So come on in,
          park your photos, and cruise around a bit. You’re in good company.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          Should you need to contact us:{' '}
          <a
            href="mailto:support@tourmygarage.com?subject=Support%20Request&body=Hi%20there,%0D%0A%0D%0AI%20need%20help%20with..."
            className="font-semibold text-blue-600 hover:underline"
          >
            Support
          </a>
        </p>
      </div>
    </>
  );
};

export default About;
