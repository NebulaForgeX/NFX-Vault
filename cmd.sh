#!/bin/bash
# ============================================
# 证书管理工具
# 用法: ./cmd.sh
# 功能：选择证书类型 -> 选择子文件夹 -> 验证证书信息
# ============================================

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 证书目录
WEBSITES_DIR="$SCRIPT_DIR/Websites"
APIS_DIR="$SCRIPT_DIR/Apis"

# 检查证书目录是否存在
if [ ! -d "$WEBSITES_DIR" ] || [ ! -d "$APIS_DIR" ]; then
  echo -e "${RED}❌ 错误: 证书目录不存在${NC}"
  exit 1
fi

# 函数：扫描子文件夹
scan_subfolders() {
  local base_dir=$1
  local subfolders=()
  
  if [ ! -d "$base_dir" ]; then
    echo -e "${RED}❌ 错误: 目录不存在: $base_dir${NC}"
    return 1
  fi
  
  # 扫描所有子文件夹（排除隐藏文件夹）
  while IFS= read -r -d '' folder; do
    if [ -d "$folder" ]; then
      subfolders+=("$(basename "$folder")")
    fi
  done < <(find "$base_dir" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print0 2>/dev/null | sort -z)
  
  # 返回子文件夹数组（通过全局变量）
  SUBFOLDERS=("${subfolders[@]}")
  
  if [ ${#SUBFOLDERS[@]} -eq 0 ]; then
    return 1
  fi
  
  return 0
}

# 函数：显示子文件夹列表
show_subfolders() {
  local subfolders=("$@")
  local index=1
  
  echo -e "${CYAN}找到以下子文件夹：${NC}"
  echo ""
  for folder in "${subfolders[@]}"; do
    echo -e "  ${GREEN}[$index]${NC} $folder"
    ((index++))
  done
  echo ""
}

# 函数：验证证书信息
verify_certificate() {
  local cert_dir=$1
  local cert_file="$cert_dir/cert.crt"
  local key_file="$cert_dir/key.key"
  
  echo -e "${CYAN}===============================================${NC}"
  echo -e "${CYAN}验证证书信息：${NC}"
  echo -e "${CYAN}===============================================${NC}"
  echo ""
  
  # 检查文件是否存在
  if [ ! -f "$cert_file" ]; then
    echo -e "${RED}❌ 证书文件不存在: $cert_file${NC}"
    return 1
  fi
  
  if [ ! -f "$key_file" ]; then
    echo -e "${RED}❌ 私钥文件不存在: $key_file${NC}"
    return 1
  fi
  
  echo -e "${GREEN}✅ 证书文件: $cert_file${NC}"
  echo -e "${GREEN}✅ 私钥文件: $key_file${NC}"
  echo ""
  
  # 验证证书信息
  if command -v openssl >/dev/null 2>&1; then
    echo -e "${CYAN}证书详细信息：${NC}"
    echo ""
    
    # 显示证书主题
    echo -e "${YELLOW}主题 (Subject):${NC}"
    openssl x509 -in "$cert_file" -noout -subject 2>/dev/null || echo -e "${RED}无法读取证书主题${NC}"
    echo ""
    
    # 显示证书颁发者
    echo -e "${YELLOW}颁发者 (Issuer):${NC}"
    openssl x509 -in "$cert_file" -noout -issuer 2>/dev/null || echo -e "${RED}无法读取证书颁发者${NC}"
    echo ""
    
    # 显示有效期
    echo -e "${YELLOW}有效期：${NC}"
    openssl x509 -in "$cert_file" -noout -dates 2>/dev/null || echo -e "${RED}无法读取证书有效期${NC}"
    echo ""
    
    # 显示域名信息
    echo -e "${YELLOW}域名信息 (SANs):${NC}"
    openssl x509 -in "$cert_file" -noout -text 2>/dev/null | grep -A 1 "Subject Alternative Name" || \
    openssl x509 -in "$cert_file" -noout -text 2>/dev/null | grep "DNS:" || \
    echo -e "${YELLOW}未找到 SANs 信息，显示 CN:${NC}" && \
    openssl x509 -in "$cert_file" -noout -subject 2>/dev/null | sed 's/.*CN=\([^,]*\).*/\1/'
    echo ""
    
    # 验证私钥
    echo -e "${YELLOW}验证私钥：${NC}"
    if openssl rsa -in "$key_file" -check -noout 2>/dev/null; then
      echo -e "${GREEN}✅ 私钥格式正确${NC}"
    else
      echo -e "${RED}❌ 私钥格式错误或无法读取${NC}"
    fi
    echo ""
    
    # 验证证书和私钥是否匹配
    echo -e "${YELLOW}验证证书和私钥是否匹配：${NC}"
    cert_md5=$(openssl x509 -noout -modulus -in "$cert_file" 2>/dev/null | openssl md5)
    key_md5=$(openssl rsa -noout -modulus -in "$key_file" 2>/dev/null | openssl md5)
    
    if [ "$cert_md5" = "$key_md5" ] && [ -n "$cert_md5" ]; then
      echo -e "${GREEN}✅ 证书和私钥匹配${NC}"
    else
      echo -e "${RED}❌ 证书和私钥不匹配${NC}"
    fi
    echo ""
    
    # 计算剩余天数
    echo -e "${YELLOW}证书状态：${NC}"
    not_after=$(openssl x509 -in "$cert_file" -noout -enddate 2>/dev/null | cut -d= -f2)
    if [ -n "$not_after" ]; then
      not_after_epoch=$(date -d "$not_after" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y" "$not_after" +%s 2>/dev/null)
      current_epoch=$(date +%s)
      days_remaining=$(( (not_after_epoch - current_epoch) / 86400 ))
      
      if [ $days_remaining -gt 0 ]; then
        if [ $days_remaining -lt 30 ]; then
          echo -e "${RED}⚠️  证书将在 $days_remaining 天后过期${NC}"
        elif [ $days_remaining -lt 60 ]; then
          echo -e "${YELLOW}⚠️  证书将在 $days_remaining 天后过期${NC}"
        else
          echo -e "${GREEN}✅ 证书有效，剩余 $days_remaining 天${NC}"
        fi
      else
        echo -e "${RED}❌ 证书已过期${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  无法计算证书剩余天数${NC}"
    fi
    
  else
    echo -e "${YELLOW}⚠️  OpenSSL 未安装，无法验证证书详细信息${NC}"
    echo -e "${YELLOW}   请安装 OpenSSL: opkg install openssl-util${NC}"
  fi
  
  echo ""
  return 0
}

# 主循环
while true; do
  # 第一层菜单：选择证书类型
  echo -e "${CYAN}===============================================${NC}"
  echo -e "${CYAN}请选择证书类型：${NC}"
  echo -e "${CYAN}===============================================${NC}"
  echo ""
  echo -e "  ${GREEN}[w]${NC}ebsites  - 网站证书"
  echo -e "  ${BLUE}[a]${NC}pis      - API 证书"
  echo -e "  ${RED}[q]${NC}uit      - 退出"
  echo ""
  read -p "请选择 [w/a/q]: " type_choice

  case "$type_choice" in
    w|W)
      CERT_TYPE="websites"
      BASE_DIR="$WEBSITES_DIR"
      ;;
    a|A)
      CERT_TYPE="apis"
      BASE_DIR="$APIS_DIR"
      ;;
    q|Q|"")
      echo -e "${YELLOW}已退出${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ 无效的选择，请重试${NC}"
      echo ""
      continue
      ;;
  esac

  # 扫描子文件夹
  echo ""
  echo -e "${CYAN}正在扫描 $CERT_TYPE 目录...${NC}"
  echo ""
  
  if ! scan_subfolders "$BASE_DIR"; then
    echo -e "${RED}❌ 未找到任何子文件夹${NC}"
    echo ""
    read -p "按 Enter 键返回..." dummy
    continue
  fi

  # 显示子文件夹列表
  show_subfolders "${SUBFOLDERS[@]}"
  
  # 第二层菜单：选择子文件夹
  while true; do
    read -p "请选择子文件夹编号 [1-${#SUBFOLDERS[@]}]，或输入 [b] 返回: " folder_choice
    
    case "$folder_choice" in
      b|B|"")
        # 返回上一级菜单
        break
        ;;
      *)
        # 验证输入是否为数字
        if [[ "$folder_choice" =~ ^[0-9]+$ ]]; then
          folder_index=$((folder_choice - 1))
          
          # 验证索引是否有效
          if [ $folder_index -ge 0 ] && [ $folder_index -lt ${#SUBFOLDERS[@]} ]; then
            selected_folder="${SUBFOLDERS[$folder_index]}"
            cert_dir="$BASE_DIR/$selected_folder"
            
            echo ""
            echo -e "${CYAN}已选择: $selected_folder${NC}"
            echo ""
            
            # 验证证书信息
            verify_certificate "$cert_dir"
            
            echo ""
            read -p "按 Enter 键返回..." dummy
            # 返回子文件夹选择菜单
            echo ""
            show_subfolders "${SUBFOLDERS[@]}"
            continue
          else
            echo -e "${RED}❌ 无效的编号，请输入 1-${#SUBFOLDERS[@]}${NC}"
            continue
          fi
        else
          echo -e "${RED}❌ 无效的输入，请输入数字或 b 返回${NC}"
          continue
        fi
        ;;
    esac
  done
  
  # 返回第一层菜单（证书类型选择）
  echo ""
done
