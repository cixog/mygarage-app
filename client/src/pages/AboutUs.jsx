import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">About Us</h1>

      <p className="mb-4 text-lg leading-relaxed">
        Welcome to{' '}
        <Link to="/" className="font-semibold text-blue-600 hover:underline">
          MyGarage
        </Link>{' '}
        – the online hangout for gearheads, collectors, and anyone who loves
        cars, bikes, or anything with an engine.
      </p>

      <p className="mb-4 text-lg leading-relaxed">
        MyGarage is a fun, easygoing space where you can build your own{' '}
        <em>virtual garage</em>. Snap a few photos, upload your favorite rides,
        and show off your collection to the world. Each user gets a personalized
        page where they can post vehicle pics, add descriptions, and tell the
        stories behind the machines.
      </p>

      {/* ... other paragraphs also corrected ... */}

      <p className="mb-4 text-lg leading-relaxed">
        Looking for something to do offline? Check out our{' '}
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
        At MyGarage, it’s all about sharing the passion. So come on in, park
        your photos, and cruise around a bit. You’re in good company.
      </p>
    </div>
  );
};

export default About;
