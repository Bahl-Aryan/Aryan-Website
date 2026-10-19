#pragma once
#include "fs.h"
#include <string>
#include <vector>

struct ParsedCommand {
  std::vector<std::string> words;
  bool redirectExists = false;
  std::string redirectTarget;
  bool shouldAppend = false;
};

class Shell {
public:
  std::string execute(const std::string &line);
  bool shouldExit() const;
  std::string prompt() const;

  static Status parseCommand(const std::string &line, ParsedCommand &out);
  static std::vector<std::string> splitWords(const std::string &line);

private:
  FileSystem fs_;
  bool exitRequested_ = false;
  static std::string convertStatus(Status status);
};
