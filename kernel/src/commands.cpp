#include "commands.h"
#include <unordered_map>

namespace {

Status pwd(FileSystem &fs, const Args &, std::string &out) {
  out = fs.pwd() + "\n";
  return Status::Ok;
}

Status cd(FileSystem &fs, const Args &args, std::string &) {
  // args has to be size = 2 -> ["cd", "<path>"]
  if (args.size() != 2) {
    return Status::InvalidArguments;
  }
  return fs.cd(args[1]);
}

Status ls(FileSystem &fs, const Args &args, std::string &out) {
  // args can be either 1 or 2 (both path and no path)
  if (!(args.size() == 1 || args.size() == 2)) {
    return Status::InvalidArguments;
  }
  std::vector<std::string> output;
  Status status = (args.size() == 2) ? fs.ls(args[1], output) : fs.ls(output);
  if (status != Status::Ok) {
    return status;
  }
  for (const auto &obj : output) {
    out += obj;
    out += "\n";
  }
  return Status::Ok;
}

Status mkdir(FileSystem &fs, const Args &args, std::string &) {
  if (args.size() != 2) {
    return Status::InvalidArguments;
  }
  return fs.mkdir(args[1]);
}

Status echo(FileSystem &, const Args &args, std::string &out) {
  for (size_t i = 1; i < args.size(); i++) {
    if (i != 1) {
      out += " ";
    }
    out += args[i];
  }
  out += "\n";
  return Status::Ok;
}

// TODO: add the other commands here

const std::unordered_map<std::string, CommandInfo> commands = {
    {"pwd", {"pwd", pwd}},
    {"cd", {"cd <path>", cd}},
    {"ls", {"ls [path]", ls}},
    {"mkdir", {"mkdir <path>", mkdir}},
    {"echo", {"echo [text...]", echo}},
    // TODO: add commands to map
};

} // namespace

const CommandInfo *findCommand(const std::string &name) {
  auto it = commands.find(name);
  return it == commands.end() ? nullptr : &it->second;
}
