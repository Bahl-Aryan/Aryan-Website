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
  static Status parseCommand(const std::string &line, ParsedCommand &out);
  static std::vector<std::string> splitWords(const std::string &line);
};
