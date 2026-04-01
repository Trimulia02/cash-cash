const { Merchant, Payment } = require("../../models");
const { ERROR_MESSAGES } = require("../constants/errorMessages");
const { Op } = require("sequelize");

class MerchantService {
  /**
   * Get all merchants with pagination
   */
  static async getAllMerchants({
    page = 1,
    limit = 10,
    category = "",
    search = "",
  } = {}) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const whereClause = {};

      if (category) {
        whereClause.category = {
          [Op.iLike]: `%${category}%`,
        };
      }

      if (search) {
        whereClause.name = {
          [Op.iLike]: `%${search}%`,
        };
      }

      const { count, rows } = await Merchant.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: "wallets",
            through: { attributes: ["amount", "createdAt"] },
          },
        ],
        order: [["name", "ASC"]],
        limit: parseInt(limit),
        offset,
      });

      return {
        count,
        merchants: rows,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search merchants by category
   */
  static async searchByCategory(category) {
    try {
      return await Merchant.findAll({
        where: {
          category: {
            [Op.iLike]: `%${category}%`,
          },
        },
        order: [["name", "ASC"]],
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get merchant details
   */
  static async getMerchantById(merchantId) {
    try {
      const merchant = await Merchant.findByPk(merchantId, {
        include: [
          {
            association: "wallets",
            through: { attributes: ["amount", "createdAt"] },
          },
        ],
      });

      if (!merchant) {
        throw new Error(ERROR_MESSAGES.MERCHANT_NOT_FOUND);
      }

      return merchant;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MerchantService;
