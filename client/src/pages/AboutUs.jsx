import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-red-400 mb-6">About Us</h1>

      <p className="mb-4 text-lg leading-relaxed">
        Welcome to{' '}
        <Link to="/" className="font-semibold text-red-400 hover:underline">
          MyTinHouse
        </Link>{' '}
        – the online hangout for gearheads, collectors, and anyone who loves
        cars, bikes, or anything with an engine.
      </p>

      <p className="mb-4 text-lg leading-relaxed">
        MyTinHouse is a fun, easygoing space where you can build your own{' '}
        <em>virtual garage</em>. Snap a few photos, upload your favorite rides,
        and show off your collection to the world. Each user gets a personalized
        page where they can post vehicle pics, add descriptions, and tell the
        stories behind the machines.
      </p>

      <p className="mb-4 text-lg leading-relaxed">
        But it’s not just about showing off — it’s about community. Browse other
        garages, drop a like, or leave a comment when something catches your
        eye. Whether you’re into classic restorations, modern builds, rare
        imports, or just the ride you’ve always loved, there’s a spot for you
        here.
      </p>

      <p className="mb-4 text-lg leading-relaxed">
        Looking for something to do offline? Check out our{' '}
        <Link to="/" className="text-red-400 font-semibold hover:underline">
          Events
        </Link>{' '}
        page — it’s a community calendar of upcoming car shows, meetups, and
        automotive events. New listings are added all the time, and we’re always
        looking for cool gatherings to spotlight.
      </p>

      <p className="mb-4 text-lg leading-relaxed">
        At MyTinHouse, it’s all about sharing the passion. So come on in, park
        your photos, and cruise around a bit. You’re in good company.
      </p>
    </div>
  );
};

export default About;
