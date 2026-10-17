// Shared helpers for the GoogleTest suites.
// AI generated
#pragma once

#include <ostream>

#include "fs.h"

// Lets GoogleTest print Status values by name in failure messages
// (otherwise an enum class prints as raw bytes). `inline` because every test
// file includes this, and a plain function defined in two files won't link.
inline void PrintTo(Status s, std::ostream *os) {
  switch (s) {
  case Status::Ok: *os << "Ok"; return;
  case Status::NotFound: *os << "NotFound"; return;
  case Status::NotADirectory: *os << "NotADirectory"; return;
  case Status::NotAFile: *os << "NotAFile"; return;
  case Status::AlreadyExists: *os << "AlreadyExists"; return;
  case Status::InvalidName: *os << "InvalidName"; return;
  case Status::InvalidArguments: *os << "InvalidArguments"; return;
  case Status::PermissionDenied: *os << "PermissionDenied"; return;
  case Status::MaxDepthReached: *os << "MaxDepthReached"; return;
  case Status::MaxFileSizeReached: *os << "MaxFileSizeReached"; return;
  }
  *os << "Status(" << static_cast<int>(s) << ")";
}
