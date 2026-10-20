#include "shell.h"
#include "commands.h"
#include <cctype>

// ---------------------------------------------------------------------------
// Public Methods
std::string Shell::prompt() const { return "aryanOS:" + fs_.pwd() + " $ "; }

bool Shell::shouldExit() const { return exitRequested_; }

std::vector<std::string> Shell::splitWords(const std::string &line) {
  // take a string like 'ls notes/' and split it into the different words
  std::vector<std::string> res;
  std::string word;
  for (size_t i = 0; i < line.size(); i++) {
    char c = line[i];
    if (std::isspace(static_cast<unsigned char>(c))) {
      if (!word.empty()) {
        res.push_back(std::move(word));
      }
      word.clear();
    } else if (c == '>') {
      if (!word.empty()) {
        res.push_back(std::move(word));
      }
      word.clear();
      if (i + 1 < line.size() && line[i + 1] == '>') {
        res.push_back(">>");
        i++;
      } else {
        res.push_back(">");
      }
    } else {
      word += c;
    }
  }
  if (!word.empty()) {
    res.push_back(std::move(word));
  }
  return res;
}

Status Shell::parseCommand(const std::string &line, ParsedCommand &out) {
  std::vector<std::string> words = splitWords(line);
  ParsedCommand cmd;
  for (size_t i = 0; i < words.size(); i++) {
    // get ref to the word, not a copy
    const std::string &word = words[i];
    if (word == ">" || word == ">>") {
      // needs to have some command before and after it
      // Note: size_t is unsigned so i - 2 would wrap to a big number, not -1 ->
      // do i + 2 to avoid it
      if (i == 0 || i + 2 != words.size()) {
        return Status::InvalidArguments;
      }
      // word after cannot be the operator again
      // use ref again here
      const std::string &target = words[i + 1];
      if (target == ">" || target == ">>") {
        return Status::InvalidArguments;
      }
      cmd.redirectExists = true;
      cmd.redirectTarget = target;
      cmd.shouldAppend = (word == ">>");
      break;
    }
    cmd.words.push_back(word);
  }
  // std::move to hand over everything to outparam
  out = std::move(cmd);
  return Status::Ok;
}

std::string Shell::execute(const std::string &line) {
  ParsedCommand cmd;
  Status status = parseCommand(line, cmd);
  if (status != Status::Ok) {
    return "kernel: syntax error\n";
  }
  if (cmd.words.empty()) {
    return ""; // nothing to run
  }
  std::string cmdName = cmd.words[0];
  if (cmdName == "exit") {
    exitRequested_ = true;
    return "";
  }
  auto info = findCommand(cmdName);
  if (info == nullptr) {
    return "kernel: " + cmdName + ": command not found\n";
  }
  std::string output;
  status = info->fn(fs_, cmd.words, output);
  if (status == Status::InvalidArguments) {
    return cmdName + ": usage: " + info->usage + "\n";
  }
  if (status != Status::Ok) {
    return cmdName + ": " + convertStatus(status) + "\n";
  }
  if (cmd.redirectExists) {
    status = fs_.write(cmd.redirectTarget, output, cmd.shouldAppend);
    if (status != Status::Ok) {
      return "kernel: " + cmd.redirectTarget + ": " + convertStatus(status) +
             "\n";
    } else {
      return ""; // output made it to the file
    }
  }
  return output;
}
// ---------------------------------------------------------------------------
// Private Methods
std::string Shell::convertStatus(Status status) {
  switch (status) {
  case Status::Ok:
    return "";
  case Status::NotFound:
    return "No such file or directory";
  case Status::NotADirectory:
    return "Not a directory";
  case Status::NotAFile:
    return "Is a directory";
  case Status::AlreadyExists:
    return "Object already exists";
  case Status::InvalidName:
    return "Invalid name";
  case Status::InvalidArguments:
    return "Invalid arguments";
  case Status::PermissionDenied:
    return "Permission denied";
  case Status::MaxDepthReached:
    return "Folder depth reached";
  case Status::MaxFileSizeReached:
    return "File too large";
  }
}
