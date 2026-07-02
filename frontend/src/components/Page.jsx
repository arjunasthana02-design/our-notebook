import React, { forwardRef } from "react";

const Page = forwardRef(({ children }, ref) => {
  return (
    <div className="page" ref={ref}>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
});

export default Page;