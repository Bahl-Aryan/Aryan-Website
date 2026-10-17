#include "shell.h"
#include <cctype>

// ---------------------------------------------------------------------------
// Public Methods
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
