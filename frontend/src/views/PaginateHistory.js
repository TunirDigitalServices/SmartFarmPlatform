import React, { useState } from "react";

const PaginateHistory = ({ totalPages, currentPage, onPageChange }) => {
    const pageLinks = [];
  
    for (let i = 1; i <= totalPages; i++) {
      const active = i === currentPage ? "active" : "";
      pageLinks.push(
        <li className={`page-item ${active}`} key={i}>
          <button className="page-link" onClick={() => onPageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
  
    return (
      <nav>
        <ul className="pagination">{pageLinks}</ul>
      </nav>
    );
  };

export default PaginateHistory;
