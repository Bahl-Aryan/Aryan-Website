#pragma once
#include <string>
#include <vector>

#include "fs.h"

using Args = std::vector<std::string>;
using CommandFn = Status (*)(FileSystem &fs, const Args &args,
                             std::string &out);

struct CommandInfo {
  std::string usage;
  CommandFn fn;
};

const CommandInfo *findCommand(const std::string &name);
