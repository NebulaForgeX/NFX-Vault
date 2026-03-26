#!/usr/bin/env bash
# NFX-Vault — 本地证书目录巡检（交互）
# 用法: ./cmd.sh
#
# 扫描路径与后端一致：$CERTS_DIR/Websites（见 backend config.cert_config、apps/file 仅 websites）。
# 与 frontend/src/apis（HTTP 客户端源码）无关，不是磁盘上的「Apis」文件夹。
#
# 环境变量：
#   CERTS_DIR          — 优先已 export；否则尝试 source 仓库 .env
#   NFXVAULT_WEBSITES_DIR — 可选，直接指定要扫描的目录（覆盖 $CERTS_DIR/Websites）

set -o nounset
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -z "${CERTS_DIR:-}" && -f "$SCRIPT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env"
  set +a
fi
CERTS_DIR="${CERTS_DIR:-$SCRIPT_DIR}"
WEBSITES_ROOT="${NFXVAULT_WEBSITES_DIR:-$CERTS_DIR/Websites}"

readonly RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m' CYAN='\033[0;36m' BOLD='\033[1m' NC='\033[0m'

err() { echo -e "${RED}❌ $*${NC}" >&2; }
ok() { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }
info() { echo -e "${CYAN}$*${NC}"; }

die() {
  err "$1"
  exit "${2:-1}"
}

require_dirs() {
  [[ -d "$WEBSITES_ROOT" ]] || die "目录不存在: $WEBSITES_ROOT（请配置 CERTS_DIR，后端与文件 API 仅使用其下的 Websites/）"
}

# 将 base 下的一级子目录名读入数组 names（按 C 排序）
list_subdirs_into() {
  local base="$1"
  local -n _out="$2"
  _out=()
  local path
  if [[ ! -d "$base" ]]; then
    return 1
  fi
  while IFS= read -r -d '' path; do
    _out+=("$(basename "$path")")
  done < <(find "$base" -mindepth 1 -maxdepth 1 -type d ! -name '.*' -print0 2>/dev/null | LC_ALL=C sort -z)
  ((${#_out[@]} > 0))
}

print_menu_header() {
  info "==============================================="
  info "$1"
  info "==============================================="
  echo ""
}

show_subfolder_list() {
  local -a folders=("$@")
  local i
  info "子文件夹："
  echo ""
  for i in "${!folders[@]}"; do
    echo -e "  ${GREEN}[$((i + 1))]${NC} ${folders[$i]}"
  done
  echo ""
}

# 解析 notAfter 为距今天数（GNU / BSD date）
days_until_expiry() {
  local not_after_line="$1"
  local end_raw
  end_raw="$(echo "$not_after_line" | sed -n 's/^notAfter=//p')"
  [[ -n "$end_raw" ]] || { echo ""; return 1; }
  local end_sec now_sec
  now_sec="$(date +%s)"
  if end_sec="$(date -d "$end_raw" +%s 2>/dev/null)"; then
    :
  elif end_sec="$(date -j -f "%b %e %T %Y %Z" "$end_raw" +%s 2>/dev/null)"; then
    :
  elif end_sec="$(date -j -f "%b %d %H:%M:%S %Y %Z" "$end_raw" +%s 2>/dev/null)"; then
    :
  else
    echo ""
    return 1
  fi
  echo "$(( (end_sec - now_sec) / 86400 ))"
}

print_cert_sans() {
  local cert_file="$1"
  local ext
  if ext="$(openssl x509 -in "$cert_file" -noout -ext subjectAltName 2>/dev/null)" && [[ -n "$ext" ]]; then
    echo "$ext"
    return 0
  fi
  if openssl x509 -in "$cert_file" -noout -text 2>/dev/null | grep -q "Subject Alternative Name"; then
    openssl x509 -in "$cert_file" -noout -text 2>/dev/null | sed -n '/Subject Alternative Name/,+3p'
    return 0
  fi
  warn "无 SAN，CN："
  openssl x509 -in "$cert_file" -noout -subject 2>/dev/null | sed 's/.*CN=\([^,]*\).*/\1/' || true
}

verify_certificate_pair() {
  local cert_dir="$1"
  local cert_file="$cert_dir/cert.crt"
  local key_file="$cert_dir/key.key"

  print_menu_header "验证证书：$cert_dir"

  [[ -f "$cert_file" ]] || { err "缺少证书: $cert_file"; return 1; }
  [[ -f "$key_file" ]] || { err "缺少私钥: $key_file"; return 1; }
  ok "证书: $cert_file"
  ok "私钥: $key_file"
  echo ""

  if ! command -v openssl >/dev/null 2>&1; then
    warn "未安装 openssl，跳过详情"
    return 0
  fi

  echo -e "${YELLOW}Subject:${NC}"
  openssl x509 -in "$cert_file" -noout -subject 2>/dev/null || err "无法读取 Subject"
  echo ""

  echo -e "${YELLOW}Issuer:${NC}"
  openssl x509 -in "$cert_file" -noout -issuer 2>/dev/null || err "无法读取 Issuer"
  echo ""

  echo -e "${YELLOW}有效期:${NC}"
  openssl x509 -in "$cert_file" -noout -dates 2>/dev/null || err "无法读取有效期"
  echo ""

  echo -e "${YELLOW}SAN / 域名:${NC}"
  print_cert_sans "$cert_file"
  echo ""

  echo -e "${YELLOW}私钥:${NC}"
  if openssl pkey -in "$key_file" -check -noout 2>/dev/null; then
    ok "私钥可解析（RSA/EC 等）"
  else
    err "私钥校验失败或格式异常"
  fi
  echo ""

  echo -e "${YELLOW}证书与私钥是否匹配（公钥指纹）:${NC}"
  local cfp kfp
  cfp="$(openssl x509 -in "$cert_file" -noout -pubkey 2>/dev/null | openssl md5 2>/dev/null || true)"
  kfp="$(openssl pkey -pubout -in "$key_file" 2>/dev/null | openssl md5 2>/dev/null || true)"
  if [[ -n "$cfp" && -n "$kfp" && "$cfp" == "$kfp" ]]; then
    ok "公钥一致"
  else
    err "公钥不一致或无法比较"
  fi
  echo ""

  echo -e "${YELLOW}过期提醒:${NC}"
  local dates_line days_left
  dates_line="$(openssl x509 -in "$cert_file" -noout -enddate 2>/dev/null || true)"
  if days_left="$(days_until_expiry "$dates_line")" && [[ -n "$days_left" ]]; then
    if (( days_left < 0 )); then
      err "证书已过期（按 notAfter 推算）"
    elif (( days_left < 30 )); then
      warn "剩余约 ${days_left} 天（建议尽快续期）"
    elif (( days_left < 60 )); then
      warn "剩余约 ${days_left} 天"
    else
      ok "剩余约 ${days_left} 天"
    fi
  else
    warn "无法计算剩余天数（日期格式或 date 命令差异）"
  fi

  echo ""
  return 0
}

pause() {
  read -r -p "按 Enter 继续..."
}

subfolder_loop() {
  local base_dir="$1"
  local -a folders=()

  info "扫描（store=websites）: $base_dir"
  echo ""

  if ! list_subdirs_into "$base_dir" folders; then
    err "未找到子文件夹"
    pause
    return 0
  fi

  while true; do
    show_subfolder_list "${folders[@]}"
    local input
    read -r -p "编号 [1-${#folders[@]}]，${BOLD}b${NC} 刷新列表，${BOLD}q${NC} 退出: " input || { info "再见。"; exit 0; }

    case "$input" in
      q | Q) info "再见。"; exit 0 ;;
      b | B | "") return 0 ;;
    esac

    if [[ "$input" =~ ^[0-9]+$ ]]; then
      local idx=$((input - 1))
      if (( idx >= 0 && idx < ${#folders[@]} )); then
        local name="${folders[idx]}"
        info "已选: $name"
        echo ""
        verify_certificate_pair "$base_dir/$name" || true
        pause
        echo ""
        continue
      fi
    fi
    err "无效输入"
    echo ""
  done
}

main() {
  require_dirs

  info "${BOLD}NFX-Vault${NC} — Websites 证书巡检（cert.crt + key.key）"
  echo -e "  ${BOLD}CERTS_DIR${NC}     $CERTS_DIR"
  echo -e "  ${BOLD}扫描目录${NC}      $WEBSITES_ROOT"
  echo ""

  while true; do
    subfolder_loop "$WEBSITES_ROOT"
    echo ""
  done
}

main "$@"
