// server/utils/catchAsync.js (Corrected with ES Modules)

const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
