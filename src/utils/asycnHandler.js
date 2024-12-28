// type AsyncFunction = (
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ) => Promise<void>;

const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
