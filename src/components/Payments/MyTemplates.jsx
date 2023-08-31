import React, { useState } from "react";

import { FaTrashAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import SectionTitle from "../../Hooks/SectionTitle";
import Swal from "sweetalert2";
import useCart from "../../Hooks/useCart";

const MyTemplates = () => {
  const PAGE_SIZE = 4; // Number of items per page
  const [cart, refetch] = useCart();
  const [currentPage, setCurrentPage] = useState(0);

  console.log(cart);

  // Calculate the total number of pages
  const pageCount = Math.ceil(cart.length / PAGE_SIZE);

  // Get the items to display on the current page
  const offset = currentPage * PAGE_SIZE;
  const currentPageItems = cart.slice(offset, offset + PAGE_SIZE);

  const total = currentPageItems.reduce(
    (sum, resume) => sum + parseFloat(resume.price),
    0
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleDelete = (resume) => {
    console.log(resume);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://resume-builder-portal-server.vercel.app/carts/${resume._id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.deletedCount > 0) {
              refetch();
              Swal.fire("Deleted!", "Your file has been deleted.", "success");
            }
          });
      }
    });
  };
  return (
    <div className="w-full">
      {/* Page Title
        <Helmet>
        <title> Resume-Genius | MyTemplates</title>
      </Helmet> */}
      <SectionTitle heading="My Templates" />

      <div className="overflow-x-auto w-full">
        <table className="table table-zebra w-full shadow-lg">
          <thead className="text-black text-md">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Template Image</th>
              {/* <th className="px-4 py-2">Class Name</th> */}
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentPageItems.map((resume, index) => (
              <tr key={resume._id}>
                <td className="px-4 py-2">{offset + index + 1}</td>
                <td className="px-4 py-2">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <img src={resume.template} alt="Avatar" />
                    </div>
                  </div>
                </td>
                {/* <td className="px-4 py-2">{item.template}</td> */}
                <td className="px-4 py-2">${resume.price}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(resume)}
                    className="btn btn-ghost bg-red-600 text-white"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className=" font-semibold h-16 flex justify-evenly items-center  mt-12">
        <h3 className="text-xl">Total Quantity: {cart.length}</h3>
        <h3 className="text-xl">Total Price: ${total}</h3>
        <Link to="/dashboard/payment">
          <button className="btn ">PAY</button>
        </Link>
      </div>
      <div className="flex justify-center mt-4">
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={"flex"}
          previousLinkClassName={"p-2 border rounded-md m-1 bg-gray-200"}
          nextLinkClassName={"p-2 border rounded-md m-1 bg-gray-200"}
          pageClassName={"p-2 border rounded-md m-1 bg-gray-200"}
          pageLinkClassName={"text-blue-500"}
          activeClassName={"bg-bg-[#93DB1F] text-white"}
        />
      </div>
    </div>
  );
};

export default MyTemplates;