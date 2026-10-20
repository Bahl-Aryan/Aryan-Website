#include "commands.h"
#include <map>

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

Status touch(FileSystem &fs, const Args &args, std::string &) {
  if (args.size() != 2) {
    return Status::InvalidArguments;
  }
  return fs.touch(args[1]);
}

Status cat(FileSystem &fs, const Args &args, std::string &out) {
  if (args.size() != 2) {
    return Status::InvalidArguments;
  }
  return fs.cat(args[1], out);
}

Status rm(FileSystem &fs, const Args &args, std::string &) {
  if (args.size() == 2) {
    return fs.rm(args[1], false);
  }
  if (args.size() == 3) {
    if (!(args[1] == "-r" || args[2] == "-r")) {
      return Status::InvalidArguments;
    }
    const std::string &path = (args[1] == "-r") ? args[2] : args[1];
    return fs.rm(path, true);
  }
  return Status::InvalidArguments;
}

Status mv(FileSystem &fs, const Args &args, std::string &) {
  if (args.size() != 3) {
    return Status::InvalidArguments;
  }
  return fs.mv(args[1], args[2]);
}

// define "help" signature here so we can have it in the table
Status help(FileSystem &, const Args &, std::string &);

const std::map<std::string, CommandInfo> commands = {
    {"pwd", {"pwd", pwd}},
    {"cd", {"cd <path>", cd}},
    {"ls", {"ls [path]", ls}},
    {"mkdir", {"mkdir <path>", mkdir}},
    {"echo", {"echo [text...]", echo}},
    {"rm", {"rm [-r] <path>", rm}},
    {"mv", {"mv <source> <dest>", mv}},
    {"touch", {"touch <path>", touch}},
    {"cat", {"cat <path>", cat}},
    {"help", {"help", help}}};

// help body defined here (definition - declaration)
Status help(FileSystem &, const Args &, std::string &out) {
  for (const auto &cmd : commands) {
    out += cmd.second.usage;
    out += "\n";
  }
  out += "exit\n";
  return Status::Ok;
}

} // namespace

const CommandInfo *findCommand(const std::string &name) {
  auto it = commands.find(name);
  return it == commands.end() ? nullptr : &it->second;
}
